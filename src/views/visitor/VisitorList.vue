<template>
  <el-row :gutter="20">
    <el-col :span="5">
      <el-tabs v-model="tabActive" @tab-click="getVisitors">
        <el-tab-pane label="全部用户" name="0">
        </el-tab-pane>
        <el-tab-pane label="在线用户" name="1">
        </el-tab-pane>
        <el-row v-for="item in visitorList" :key="item.visitor.visitor_id" class="visitorListBg">
          <div
              style="cursor:pointer"
              class="onlineUsers"
              v-bind:class="{'cur': item.visitor.visitor_id===currentGuest }"
              @click="changeVisitor(item.visitor.visitor_id)"
          >

            <el-col :span="12">
              <el-avatar v-bind:class="{'imgGray': item.visitor.is_online==0 }" :size="40"
                         :src="item.visitor.avatar"></el-avatar>

              <el-badge :value="item.unreadQuantity" class="item" v-if="item.unreadQuantity>0"></el-badge>
            </el-col>

            <el-col :span="10" :offset="1">
              {{ item.visitor.source_ip }} {{ item.visitor.area }}
            </el-col>
          </div>
        </el-row>
      </el-tabs>


    </el-col>
    <el-col :span="12">
      <el-alert
          :closable="false"
          type="success"
          show-icon
          :title="currentGuest"
      >
      </el-alert>

      <div class="kefuMainBg chatBgContext">

        <div class="chatBox" ref="scrollbarRef">
          <el-row :gutter="2" v-for="v in currentVisitor.messageList"
                  v-bind:class="{'chatBoxMe': v.isVisitor===false}">
            <div class="chatTime">{{ v.time }}</div>
            <div class="chatRow">
              <div class="chatContent" v-html="v.content"></div>
            </div>
          </el-row>
        </div>


        <div class="kefuFuncBox">
          <el-input
              type="textarea"
              class="chatArea"
              :rows="1"
              v-model="messageContent"
              placeholder="请输入内容">
          </el-input>
          <div class="iconBtnsBox">
            <el-button class="kefuSendBtn" size="small" type="primary" @click="sendMessageToVisitor">
              发送
            </el-button>
          </div>
          <div class="clear"></div>
        </div>

      </div>

    </el-col>
    <el-col :span="6">
      <el-tabs v-model="rightTabActive">
        <el-tab-pane label="访客信息" name="visitorInfo">
          <el-form
              label-position="left"
              label-width="100px"
              v-if="currentVisitor.visitor"
          >
            <el-form-item label="ID">
              {{ currentVisitor.visitor.visitor_id }}
            </el-form-item>
            <el-form-item label="指纹">
              {{ currentVisitor.visitor.fingerprint }}
            </el-form-item>
            <el-form-item label="IP地址">
              {{ currentVisitor.visitor.source_ip }}
            </el-form-item>
            <el-form-item label="城市">
              {{ currentVisitor.visitor.area }}
            </el-form-item>
            <el-form-item label="首次访问">
              {{ currentVisitor.visitor.CreatedAt }}
            </el-form-item>
            <el-form-item label="最后访问">
              {{ currentVisitor.visitor.last_login_at }}
            </el-form-item>
            <el-form-item label="黑名单">
              <el-switch
                  v-model="currentVisitor.visitor.status"
                  active-text="是"
                  inactive-text="否"
                  :active-value="2"
                  :inactive-value="1"
                  @change="changVisitorStatus"
              />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="currentVisitor.visitor.extra" :rows="3" type="textarea"/>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>

<script>
import {reactive, ref, computed, nextTick} from "vue"
import {getVisitorList, UpdateVisitorStatus} from "../../api/visitor"
import {onBeforeMount} from 'vue'
import {getToken} from '@/utils/auth'
import {sendMessage, getMessage} from "../../api/message";
import {ElMessage} from 'element-plus'


const defaultParams = {
  page: 1,
  page_size: 100,
  is_online: 1
}
export default {
  name: "VisitorList",
  setup() {
    let socket = null

    const params = reactive(defaultParams)
    const visitors = reactive({})
    const messageContent = ref("")
    const visitor = reactive({})
    const currentGuest = ref(null)
    const tabActive = ref("0")
    const rightTabActive = ref("visitorInfo")
    const scrollbarRef = ref(null)
    const scrollToBottom = () => {
      nextTick(() => {
        scrollbarRef.value.scrollTo({
          top: scrollbarRef.value.scrollHeight,
          //滚动过渡效果
          behavior: "smooth"
        })
      })

    }
    const getVisitors = () => {
      params.is_online = parseInt(tabActive.value)
      Object.keys(visitors).map(key => {
        delete visitors[key]
      })
      getVisitorList(params).then(res => {
        for (const item of res.data) {
          visitors[item.visitor_id] = {
            visitor: item,
            messageList: [],
            unreadQuantity: item.waiter_unread_quantity,
            lastMessageTime: 0,
          }
        }
      })
    }
    getVisitors()
    const initSocket = () => {
      let intervalID = null
      const token = getToken()
      socket = new WebSocket(
          // 此处填写你要连接的ws地址
          import.meta.env.VITE_APP_WS + token
      )

      socket.onopen = () => {
        /*
         * 连接成功
         * */
        // 发送心跳防止ws协议自动断联
        intervalID = setInterval(() => {
          socket.send(JSON.stringify({type: "ping", data: "ping"}))
        }, 1000 * 2)
      }
      socket.onmessage = (e) => {
        /*
         * 收到消息时回调函数
         * */
        let data = JSON.parse(e.data)
        if (data.type == "notice") {
          const log = {
            isVisitor: true,
            content: data.data.content,
            time: getDateFormat()
          }
          if (!visitors[data.data.visitor_id]) {
            visitors[data.data.visitor_id] = {
              messageList: [],
              unreadQuantity: 0,
              lastMessageTime: new Date().getTime(),
              visitor: data.data.visitor,
            }
          }
          visitors[data.data.visitor_id].messageList.push(log)
          visitors[data.data.visitor_id].lastMessageTime = new Date().getTime()
          if (currentGuest.value !== data.data.visitor_id) {
            visitors[data.data.visitor_id].unreadQuantity = visitors[data.data.visitor_id].unreadQuantity + 1
          } else {
            scrollToBottom()
          }

        }
      }
      socket.onerror = () => {
        /*
         * 通讯异常
         * */
        ElMessage.error("WebSocket 通讯异常")
        if (intervalID) {
          window.clearInterval(intervalID)
        }
      }
      socket.close = () => {
        /*
         * 关闭连接时回调函数
         * */
        ElMessage.error("WebSocket 连接已经断开")
        if (intervalID) {
          window.clearInterval(intervalID)
        }
      }

    }

    onBeforeMount(() => {
      initSocket()
    })

    const sendMessageToVisitor = () => {
      const data = {
        visitor_id: currentGuest.value,
        content: messageContent.value
      }
      if (!currentGuest.value) {
        ElMessage.error("请选择一个访客")
        return false
      }

      sendMessage(data).then(res => {
        const log = {
          isVisitor: false,
          content: messageContent.value,
          time: getDateFormat()
        }
        messageContent.value = ""

        visitors[data.visitor_id].messageList.push(log)
        visitors[data.visitor_id].lastMessageTime = new Date().getTime()

        if (currentGuest.value !== data.visitor_id) {
          visitors[data.visitor_id].unreadQuantity = visitors[data.visitor_id].unreadQuantity + 1
        }
        scrollToBottom()
      })
    }
    const getMessages = (visitorId) => {
      const params = {
        visitor_id: visitorId,
        page: 1,
        page_size: 20
      }
      getMessage(params).then(res => {
        if (!visitors[visitorId]) {
          visitors[visitorId] = {
            messageList: [],
            unreadQuantity: 0,
          }
        }
        res.data.reverse();

        for (const data of res.data) {
          let log = {
            isVisitor: data.mes_type === 1,
            content: data.content,
            time: data.CreatedAt
          }
          visitors[visitorId].messageList.push(log)

        }
      })

    }


    const changeVisitor = (visitorId) => {
      currentGuest.value = visitorId
      if (visitors[visitorId].messageList.length < 1) {
        getMessages(visitorId)
      }
      visitors[visitorId].unreadQuantity = 0

      scrollToBottom()
    }

    const currentVisitor = computed({
      get: () => {
        return visitors[currentGuest.value] ? visitors[currentGuest.value] : {
          messageList: [],
          unreadQuantity: 0,
          lastMessageTime: 0,
        }
      },
      set: (obj) => {
        return visitors[currentGuest.value].visitor.status = obj.status
      }
    })

    const visitorList = computed({
      get: () => {
        let list = []
        for (const visitorId in visitors) {
          list.push(visitors[visitorId])
        }

        const sort = (x, y) => {
          return y.lastMessageTime - x.lastMessageTime;
        }
        list.sort(sort)
        return list

      },
    })

    const getDateFormat = () => {
      const now = new Date()
      const date = now.getDate()
      const month = now.getMonth() + 1
      return `${date}-${month} ${now.getHours()}:${now.getMinutes()} `

    }
    const changVisitorStatus = (status) => {
      const data = {
        status: status,
        visitor_id: currentGuest.value
      }
      UpdateVisitorStatus(data).then(res => {
        ElMessage.success("操作成功")
      })
    }


    return {
      visitors,
      tabActive,
      currentGuest,
      currentVisitor,
      visitor,
      messageContent,
      scrollbarRef,
      visitorList,
      rightTabActive,
      sendMessageToVisitor,
      changeVisitor,
      getVisitors,
      changVisitorStatus,
    }

  }
}
</script>

<style scoped>
@import url("/src/assets/css/chat.css");

.onlineUsers {
  padding: 4px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  border-bottom: solid 1px #f1f1f1;
  border-left: 4px solid #fff;
  width: 100%;
}

.onlineUsers:hover, .onlineUsers.cur {
  background-color: rgb(238 247 255);
  border-left: 4px solid #4299e2;
}

.imgGray {
  -webkit-filter: grayscale(100%);
  -ms-filter: grayscale(100%);
  filter: grayscale(100%);
  filter: gray;
  color: #888;
}

.visitorListBg {
  background: #fff;
  border: solid 1px #e6e6e6;
}

.chatBox {
  height: 600px;
  background: rgb(245, 245, 245);
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.kefuMainBg {
  background: #f5f5f5;
  border: solid 1px #e6e6e6;
  boder-top: none;
}


.chatBgContext .el-row {
  margin-bottom: 5px;
}

.chatBgContext {
  position: relative;
  height: 100%;
  width: 100%;
}


.clear {
  clear: both;
}

.chatUser {
  line-height: 24px;
  font-size: 12px;
  white-space: nowrap;
  color: #999;
}

.chatBoxMe .chatUser {
  text-align: right
}

.chatTime {
  text-align: center;
  color: #bbb;
  margin: 5px 0;
  font-size: 12px;
  width: 100%
}

</style>
