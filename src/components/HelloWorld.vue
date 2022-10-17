<template>
  <div class="box">
    <div v-for="(item, index) in msgList">{{ item }}</div>
  </div>
  <div class="input">
    <input type="text" v-model="text" placeholder="请输入你要发送的内容" />
  </div>
  <div class="send">
    <button @click="sendMessage">发送</button>
  </div>
</template>
<script setup>
import TIM from "tim-js-sdk";
import { getCurrentInstance, onMounted, ref } from "vue";
defineProps({
  msg: {
    type: String,
    required: true,
  },
});
const { proxy } = getCurrentInstance();

const text = ref("");
const msgList = ref([]); // 消息列表。
const nextReqMessageID = ref(""); // 用于续拉，分页续拉时需传入该字段。
const isCompleted = ref(true); // 表示是否已经拉完所有消息。

onMounted(() => {
  //监听到登录状态之后，  打开某个会话时，第一次拉取消息列表
  proxy.$tim.on(TIM.EVENT.SDK_READY, () => {
    let promise = proxy.$tim.getMessageList({
      conversationID: "C2Cadministrator",
      count: 15,
    });
    promise.then(function (imResponse) {
      // console.log("获取历史消息2222", imResponse.data);
      msgList.value = imResponse.data.messageList.map((x) => {
        return x.payload.text;
      });
      nextReqMessageID.value = imResponse.data.nextReqMessageID;
      isCompleted.value = imResponse.data.isCompleted;
    });
  });
});

function sendMessage() {
  // 设置发送人
  let message = proxy.$tim.createTextMessage({
    to: "administrator", //发送人
    conversationType: TIM.TYPES.CONV_C2C,
    // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
    // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
    // priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
    payload: {
      text: text.value,
    },
  });
  msgList.value.push(text);
  // 发送消息
  let promise = proxy.$tim.sendMessage(message);
  promise
    .then(function (imResponse) {
      // 发送成功
      console.log("发送成功！！", imResponse);
    })
    .catch(function (imError) {
      // 发送失败
      console.warn("sendMessage error:", imError);
    });
}
</script>
<style scoped>
.box {
  width: 300px;
  height: 600px;
  border: 1px solid orangered;
}
</style>
