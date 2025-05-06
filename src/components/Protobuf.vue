<script setup lang="ts">
import { ref } from 'vue';
import JsonTextarea from '../view/JsonTextarea.vue';
import CustomModal from '../view/CustomModal.vue';
import '@assets/styles/tool.css';
import showMessage from '../utils/MessageService';
import * as protobuf from 'protobufjs';

const title = ref('Protobuf工具');
const inputText = ref('');
const outputText = ref('');
const errorMessage = ref('');
const operationType = ref<'encode' | 'decode'>('decode');
const showFieldIds = ref(false);
const indentSize = ref(2);

// 自动检测编码格式
function detectEncodingType(input: string): 'hex' | 'base64' {
  const hexRegex = /^[0-9a-fA-F]+$/;
  if (hexRegex.test(input.replace(/\s+/g, ''))) {
    return 'hex';
  }
  try {
    atob(input);
    return 'base64';
  } catch {
    return 'hex';
  }
}
// Uint8Array 转 hex
function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Uint8Array 转 base64
function uint8ArrayToBase64(bytes: Uint8Array): string {
  const binaryString = Array.from(bytes)
    .map(byte => String.fromCharCode(byte))
    .join('');
  return btoa(binaryString);  // base64 编码
}
// hex 转 Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  hex = hex.replace(/\s+/g, '').replace(/^0x/i, '');
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// base64 转 Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64.trim());
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    throw new Error(`Base64解码失败: ${e}`);
  }
}

function encodeProtobuf(jsonData: any): Uint8Array {
  try {
    const root = new protobuf.Root();
    const DynamicMessage = new protobuf.Type('DynamicMessage');
    root.add(DynamicMessage);

    // 为了处理键是数字字符串的情况，我们需要确保创建有效的Protobuf字段名称
    const sanitizeFieldName = (name: string): string => {
      // 如果键是纯数字，添加前缀 "f_" 使其成为有效的字段名
      if (/^\d+$/.test(name)) {
        return `f_${name}`;
      }
      // 将任何非字母数字字符替换为下划线
      return name.replace(/[^a-zA-Z0-9_]/g, '_');
    };

    // 为字段创建一个唯一的序号，避免冲突
    const createFieldNumber = (key: string, index: number): number => {
      // 如果键是纯数字，直接使用该数字作为字段编号（确保在有效范围内）
      if (/^\d+$/.test(key)) {
        const num = parseInt(key, 10);
        // Protobuf 字段编号必须在 1-536870911 范围内
        if (num > 0 && num < 536870911) {
          return num;
        }
      }
      // 否则使用索引加1（避免0）
      return index + 1;
    };

    const processObject = (obj: any, parentType: protobuf.Type, prefix: string = '', fieldNumberBase: number = 0) => {
      Object.keys(obj).forEach((key, index) => {
        const fieldName = sanitizeFieldName(key);
        const fieldNumber = createFieldNumber(key, fieldNumberBase + index);
        const value = obj[key];
        let type: string;

        if (typeof value === 'number') {
          if (Number.isInteger(value)) {
            type = value >= -2147483648 && value <= 2147483647 ? 'int32' : 'int64';
          } else {
            type = 'double';
          }
          parentType.add(new protobuf.Field(fieldName, fieldNumber, type));
        } else if (typeof value === 'boolean') {
          parentType.add(new protobuf.Field(fieldName, fieldNumber, 'bool'));
        } else if (typeof value === 'string') {
          parentType.add(new protobuf.Field(fieldName, fieldNumber, 'string'));
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            const firstElem = value[0];
            if (typeof firstElem === 'number') {
              type = Number.isInteger(firstElem) ? 'int32' : 'double';
            } else if (typeof firstElem === 'boolean') {
              type = 'bool';
            } else if (typeof firstElem === 'string') {
              type = 'string';
            } else if (firstElem !== null && typeof firstElem === 'object') {
              // 创建嵌套类型来处理对象数组
              const nestedTypeName = `${prefix}${fieldName}_Item`;
              const NestedType = new protobuf.Type(nestedTypeName);
              root.add(NestedType);

              // 使用第一个对象来定义结构
              processObject(firstElem, NestedType, `${nestedTypeName}_`, 0);
              type = nestedTypeName;
            } else {
              type = 'bytes'; // 对于不能确定类型的情况
            }
          } else {
            type = 'bytes'; // 空数组默认
          }
          parentType.add(new protobuf.Field(fieldName, fieldNumber, type, { repeated: true }));
        } else if (value !== null && typeof value === 'object') {
          // 嵌套对象
          const nestedTypeName = `${prefix}${fieldName}`;
          const NestedType = new protobuf.Type(nestedTypeName);
          root.add(NestedType);

          // 递归处理嵌套对象
          processObject(value, NestedType, `${nestedTypeName}_`, 0);

          parentType.add(new protobuf.Field(fieldName, fieldNumber, nestedTypeName));
        } else {
          // null 或 undefined
          parentType.add(new protobuf.Field(fieldName, fieldNumber, 'bytes'));
        }
      });
    };

    // 处理顶层对象
    processObject(jsonData, DynamicMessage);

    // 解析所有类型引用
    root.resolveAll();

    // 深度递归处理对象，确保所有键都正确映射
    const sanitizeData = (data: any): any => {
      if (data === null || data === undefined) {
        return null;
      }

      if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
      }

      if (typeof data === 'object') {
        const result: any = {};
        Object.keys(data).forEach(key => {
          const sanitizedKey = sanitizeFieldName(key);
          result[sanitizedKey] = sanitizeData(data[key]);
        });
        return result;
      }

      return data;
    };

    const sanitizedData = sanitizeData(jsonData);
    const message = DynamicMessage.fromObject(sanitizedData);
    return DynamicMessage.encode(message).finish();
  } catch (err: any) {
    console.error('编码错误:', err);
    console.error('错误详情:', err.stack);
    throw new Error(`Protobuf 编码失败: ${err.message}`);
  }
}


// 检查数据是否可能是 Protobuf 消息
function isLikelyProtobuf(bytes: Uint8Array): boolean {
  if (bytes.length < 2) return false;

  // 尝试检测 Protobuf 消息的特征
  try {
    const tempReader = new protobuf.Reader(bytes);
    let fieldCount = 0;
    const maxPos = Math.min(tempReader.len, 16); // 只检查前16个字节

    while (tempReader.pos < maxPos && fieldCount < 2) {
      const tag = tempReader.uint32();
      const fieldId = tag >>> 3;
      const wireType = tag & 7;

      // 有效的 wireType 范围是 0-5，字段 ID 不能为 0
      if (wireType > 5 || fieldId === 0) {
        return false;
      }

      // 跳过当前字段的值
      tempReader.skipType(wireType);
      fieldCount++;
    }

    return fieldCount > 0;
  } catch {
    return false;
  }
}

// 解码 Protobuf
function decodeProtobuf(buffer: Uint8Array, depth: number = 0): any {
  try {
    // 防止递归过深导致堆栈溢出
    if (depth > 1145) {
      return { __error: "递归解析深度超过限制" };
    }

    const reader = new protobuf.Reader(buffer);
    const result: any = {};

    while (reader.pos < reader.len) {
      try {
        const tag = reader.uint32();
        const fieldId = tag >>> 3;
        const wireType = tag & 7;

        let value: any;

        // 跳过无效的 wireType（如 4 和 7）
        if (wireType === 4 || wireType === 7) {
          // result[`__error_at_${reader.pos}`] = `无效的 wire type ${wireType} at offset ${reader.pos}`;
          // reader.skipType(wireType); // 跳过无效的字段
          continue;
        }

        switch (wireType) {
          case 0: // varint
            value = reader.uint64();
            break;
          case 1: // 64-bit
            value = reader.double();
            break;
          case 2: // 长度分隔
            const bytes = reader.bytes();
            if (bytes.length > 0) {
              try {
                // 检查是否为嵌套的 Protobuf 消息
                if (isLikelyProtobuf(bytes)) {
                  value = decodeProtobuf(bytes, depth + 1); // 递归解析嵌套消息
                } else {
                  value = new TextDecoder().decode(bytes); // 作为字符串处理
                }
              } catch (nestedErr) {
                console.warn('嵌套Protobuf解析失败:', nestedErr);
                value = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''); // 十六进制显示
              }
            } else {
              value = {};
            }
            break;
          case 5: // 32-bit
            value = reader.float();
            break;
          default:
            reader.skipType(wireType); // 跳过不合法的 wireType
            continue;
        }

        let fieldKey = `field_${fieldId}`;

        // 如果不显示字段ID，则使用数字作为键名，更简洁
        if (!showFieldIds.value) {
          fieldKey = fieldId.toString();
        }

        // 处理重复字段
        if (result[fieldKey] !== undefined) {
          if (!Array.isArray(result[fieldKey])) {
            result[fieldKey] = [result[fieldKey]];
          }
          result[fieldKey].push(value);
        } else {
          result[fieldKey] = value;
        }

        // 如果要显示字段ID但使用了数字键名，添加类型信息
        if (showFieldIds.value) {
          const wireTypeNames = ['VARINT', '64BIT', 'LENGTH', '', '', '32BIT'];
          result[`__type_${fieldKey}`] = wireTypeNames[wireType] || `UNKNOWN(${wireType})`;
        }
      } catch (parseErr) {
        // 捕获特定字段解析错误，但继续尝试解析剩余内容
        console.warn(`字段解析错误: ${parseErr}`);

        // 记录错误信息到结果中
        //const errorKey = `__error_at_${reader.pos}`;
        //result[errorKey] = `解析错误: ${parseErr || '未知错误'}`;

        // 尝试前进一些字节以恢复
        if (reader.pos < reader.len) {
          reader.pos++;
        } else {
          break;
        }
      }
    }

    return result;
  } catch (err: any) {
    console.error("解码错误:", err);
    throw new Error(`Protobuf 解码失败: ${err.message}`);
  }
}

// 处理数据
const processData = () => {
  if (!inputText.value.trim()) {
    showMessage('请输入要处理的内容', { type: 'warning' });
    return;
  }
  try {
    errorMessage.value = '';

    if (operationType.value === 'decode') {
      const cleanedInput = inputText.value.trim();
      const encoding = detectEncodingType(cleanedInput);
      let buffer: Uint8Array;

      try {
        buffer = encoding === 'hex' ? hexToUint8Array(cleanedInput) : base64ToUint8Array(cleanedInput);
      } catch (e: any) {
        showMessage(`数据格式错误: ${e.message}`, { type: 'error' });
        return;
      }

      const decoded = decodeProtobuf(buffer);
      outputText.value = JSON.stringify(decoded, null, indentSize.value);
    } else {
      try {
        const obj = JSON.parse(inputText.value);
        const encoded = encodeProtobuf(obj);

        const format = detectEncodingType(inputText.value);
        // 处理 Protobuf 编码的输出
        outputText.value = format === 'hex'
          ? uint8ArrayToHex(encoded)
          : uint8ArrayToBase64(encoded);

      } catch (e: any) {
        showMessage('JSON 解析失败: ' + e.message, { type: 'error' });
        return;
      }
    }
  } catch (err: any) {
    errorMessage.value = err.message;
    showMessage('处理失败: ' + err.message, { type: 'error' });
  }
};

const clear = () => {
  inputText.value = '';
  outputText.value = '';
  errorMessage.value = '';
};

const swap = () => {
  const temp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = temp;
};

const copyOutput = () => {
  try {
    if (!outputText.value) {
      showMessage('空的你复制个鸡毛', { type: 'warning' });
      return;
    }
    navigator.clipboard.writeText(outputText.value);
    showMessage('复制成功', { type: 'success' });
  } catch (e) {
    showMessage('复制失败，请手动复制', { type: 'error' });
  }
};
</script>

<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2>{{ title }} 该页面未完工,等待Admilk......</h2>
    </div>
    <div class="tool-content">
      <div class="feature-card">
        <!-- 操作类型选择 -->
        <div class="operation-toggle">
          <button :class="{ active: operationType === 'decode' }" @click="operationType = 'decode'">
            解码
          </button>
          <button :class="{ active: operationType === 'encode' }" @click="operationType = 'encode'">
            编码
          </button>
        </div>

        <!-- 设置区域 -->
        <div class="settings-group">
          <div class="indent-group">
            <label>缩进</label>
            <input type="number" v-model="indentSize" min="0" max="8">
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-group">
          <JsonTextarea v-model="inputText"
            :placeholder="operationType === 'decode' ? '输入Protobuf数据...' : '输入JSON数据...'" :readonly="false" />
        </div>

        <!-- 操作按钮 -->
        <div class="button-group">
          <button @click="processData" class="encode-btn">{{ operationType === 'decode' ? '解码' : '编码' }}</button>
          <button @click="clear" class="clear-btn">清空</button>
          <button @click="copyOutput" class="copy-btn">复制</button>
          <button class="encode-btn" @click="swap">↑ ↓</button>
        </div>

        <!-- 输出区域 -->
        <div class="output-group">
          <JsonTextarea v-model="outputText" :placeholder="operationType === 'decode' ? '解码结果...' : '编码结果...'"
            :readonly="true" :collapsible="true" />
        </div>
      </div>
    </div>
    <CustomModal ref="modal" />
  </div>
</template>

<style scoped></style>
