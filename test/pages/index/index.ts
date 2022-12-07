import {Client, ConnError} from "ts-streamclient-base"
import {NewClient} from "ts-streamclient-wxapp"

let client: Client|null = null
let wss: string = ""

class Cache {
  wss: string = ""
  key1 = ""
  value1 = ""
  key2 = ""
  value2 = ""
  key3 = ""
  value3 = ""
  body = ""
}

Page({
  data: {
    wss: "",
    // headers:[{key: "", value: ""}, {key: "", value: ""}, {key: "", value: ""}],
    key1: "",
    value1: "",
    key2: "",
    value2: "",
    key3: "",
    value3: "",
    body:"",
    out:[{type:3, data:"result --- "}]
  },

  onLoad(): void | Promise<void> {
    try {
      let cache = wx.getStorageSync<Cache>("last")
      if (!cache) {
        return
      }

      this.data.wss = cache.wss

      this.data.key1 = cache.key1
      this.data.value1 = cache.value1
      this.data.key2 = cache.key2
      this.data.value2 = cache.value2
      this.data.key3 = cache.key3
      this.data.value3 = cache.value3

      this.data.body = cache.body

      this.setData(this.data)

    } catch (e) {
      // nothing
    }
  },

  async send() {
    if (client == null || this.data.wss !== wss) {
      wss = this.data.wss
      client = NewClient(this.data.wss)
      client.setPushCallback(data=>{
        this.data.out.push({type:1, data:data.toString()})
        this.setData(this.data)
      })
      client.setPeerClosedCallback(()=>{
        this.data.out.push({type:2, data:"conn: closed by peer"})
        this.setData(this.data)
      })
    }

    let cache = new Cache()
    cache.wss= wss
    cache.key1 = this.data.key1
    cache.value1 = this.data.value1
    cache.key2 = this.data.key2
    cache.value2 = this.data.value2
    cache.key3 = this.data.key3
    cache.value3 = this.data.value3
    cache.body = this.data.body

    let headers = new Map<string, string>()
    if (cache.key1 !== "") {
      headers.set(cache.key1, cache.value1)
    }
    if (cache.key2 !== "") {
      headers.set(cache.key2, cache.value2)
    }
    if (cache.key3 !== "") {
      headers.set(cache.key3, cache.value3)
    }

    await wx.setStorage({key:"last", data:cache})
    let [ret, err] = await client.send(this.data.body, headers)

    if (err !== null) {
      if (err instanceof ConnError) {
        client = null
        this.data.out.push({type:2, data:"conn-error: " + err.message})
      } else {
        this.data.out.push({type:2, data:"resp-error: " + err.message})
      }
    } else {
      let str = ret.toString()
      this.data.out.push({type:3, data:"resp: " + str + "\n\t json: " + JSON.stringify(JSON.parse(str))})
    }
    this.setData(this.data)
  },
})