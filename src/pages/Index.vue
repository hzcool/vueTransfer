<template>
  <div>
    <div>
      <Modal
          v-model="pwdCheckModal"
          title="密码验证"
          :closable="false"
          :mask-closable="false"
      >
        <div style="color: red">
          密 码 : <i-input v-model="pwd" style="width: 430px"　type="password" password/>
        </div>
        <div slot="footer">
          <i-button type="primary" @click="checkPwd"> 确认 </i-button>
        </div>
      </Modal>
    </div>
    <div style="margin: 20px 10px" v-if="show">
      <i-button type="primary"  @click="back" :disabled="path==''"> 返回上一层 </i-button>
      <i-button type="primary"  @click="backRoot" :disabled="path==''" style="margin-left: 20px"> 返回根目录 </i-button>
      <i-button type="success"  @click="toMkdir" style="margin-left: 20px"> 创建文件夹 </i-button>
      <i-button type="warning"  @click="toUpload(false)"  style="margin-left: 20px" > 上传文件 </i-button>
      <i-button type="warning"  @click="toUpload(true)"  style="margin-left: 20px"> 上传文件夹 </i-button>
      <div style="margin-top: 15px">
        <List>
          <ListItem style="font-size: 1rem;color: black">
            <span style="width: 40%">文件</span>
            <span style="width: 20%">大小</span>
            <span style="width: 20%">修改于</span>
            <span style="width: 20%">操作</span>
          </ListItem>
          <ListItem v-for="(row,idx) in files" :key="idx">
            <span style="width: 40%">
              <span :class="'fiv-viv fiv-icon-'+row.type" style="font-size: 2.5rem;" > </span>
              <i-button type="text" v-if="row.is_dir"  @click="showDir(row.name)"> <span style="color:deepskyblue;font-size: 1rem"> {{row.name}} </span> </i-button>
              <a :href="row.staticPath" v-if="!row.is_dir" target="_blank">  <i-button type="text"> <span style="color: black;font-size: 1rem"> {{row.name}} </span> </i-button>  </a>
            </span>
            <span style="width: 20%">
              {{getSize(row)}}
            </span>
            <span style="width: 20%">
              {{row.created_at}}
            </span>
            <span style="width: 20%">
              <i-button type="primary" v-if="row.is_dir" @click="showDir(row.name)"> 进入 </i-button>
              <a :href="row.staticPath" v-if="!row.is_dir" target="_blank">  <i-button type="warning"> 查看 </i-button>  </a>
              <i-button type="info" style="margin-left: 10px" @click="toDownload(row)" v-if="row.is_dir"> 下载 </i-button>
              <a :href="row.staticPath" :download="row.name" v-if="!row.is_dir" target="_blank"　style="margin-left: 10px">  <i-button type="info"> 下载 </i-button> </a>
              <i-button type="error" @click="deleteFile(row.name)" style="margin-left: 10px" > 删除 </i-button>
              <i-button type="success" style="margin-left: 10px" @click="toReName(row)"> 重命名 </i-button>
            </span>
          </ListItem>
        </List>
      </div>
      <Modal
          v-model="mkdirModal"
          title="创建文件夹"
      >
        <div style="color: red">
          文件夹名: <i-input v-model="dirName" style="width: 400px"/>
        </div>
        <div slot="footer">
          <i-button type="text" @click="mkdirModal=false"> 取消 </i-button>
          <i-button type="primary" @click="mkdir"> 创建 </i-button>
        </div>
      </Modal>

      <Modal
          v-model="uploadModal"
          title="上传"
          :mask-closable="false"
          :closable="false"
      >
        <Upload
            multiple
            :before-upload="handleUpload"
            :webkitdirectory="forDir"
            type="drag"
            action="//jsonplaceholder.typicode.com/posts/">
          <div style="padding: 20px 0">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p style="color: black" v-if="forDir"> 选择文件夹 </p>
            <p style="color: black" v-else> 选择文件 </p>
          </div>
        </Upload>
        <div v-if="uploads.length>0" style="font-size: 18px;margin-top: 10px" >
          <div> choosed file : </div>
          <div v-for="i in Math.min(uploads.length,5)" :key="i" style="color: red">
            <div v-if="forDir"> {{uploads[i-1].webkitRelativePath}} </div>
            <div v-else> {{uploads[i-1].name}} </div>
          </div>
          <div v-if="uploads.length > 5">...</div>
          <div style="margin-top: 10px">
            已选中 <span style="color: red">{{uploads.length}} </span> 个文件, 总大小　<span style="color: red">{{ (totalSize/1048576).toFixed(2)}} MB </span>
          </div>
        </div>
        <div v-if="doneSize>0" style="font-size: 18px;margin-top: 5px">　
          <Progress :percent="uploadPercent" :stroke-color="['#108ee9', '#87d068']" :stroke-width="18" text-inside/>
          已上传 : <span style="color: crimson"> {{ (doneSize/1048576).toFixed(2)}} MB </span>
          <span style="float: right">速率 :  <span style="color: crimson"> {{uploadSpeed}} MB/S </span> </span>
        </div>
        <div slot="footer">
          <i-button type="text" @click="uploadModal=false"> 取消 </i-button>
          <i-button type="primary" @click="submit"> 上传 </i-button>
        </div>
      </Modal>
      <Modal
          v-model="readModal"
          :title="readFileName"
      >
        <div style="margin: 10px 5px;">
          <i-input v-model="fileContent" type="textarea" :autosize="{minRows: 2,maxRows: 8}" readonly style="width: 100%"/>
        </div>
      </Modal>

      <Modal
        v-model="downModal"
        title="下载"
        :mask-closable="false"
        :closable="false"
      >
        <div style="font-size: 18px;">
          文件 : <span style="color: crimson"> {{downFile.name}} </span>  <span style="float: right"> 总大小 : <span style="color: crimson">{{ (downFile.size/1048576).toFixed(2)}} MB</span> </span>
        </div>
        <div style="font-size: 18px;margin-top: 10px">
          <Progress :percent="downPercent" :stroke-color="['#108ee9', '#87d068']" :stroke-width="18" text-inside/>
          已下载 : <span style="color: crimson"> {{ (downSize/1048576).toFixed(2)}} MB </span>
          <span style="float: right">速率 :  <span style="color: crimson"> {{downSpeed}} MB/S </span> </span>
        </div>
        <div slot="footer">
          <i-button type="primary" @click="downCancel = true"> 取消 </i-button>
        </div>
      </Modal>

      <Modal
        v-model="reNameModal"
        title="重命名"
        :mask-closable="false"
        :closable="false"
        width="400px"
      >
        <div v-if="reNameFile">
          <i-input v-model="newName">
            <span slot="append"> <span v-if="!reNameFile.is_dir">.</span>{{reNameFile.type}} </span>
          </i-input>
        </div>
        <div slot="footer">
          <i-button type="text" @click="reNameModal=false"> 取消 </i-button>
          <i-button type="primary" @click="reName"> 确认 </i-button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import {saveAs} from 'file-saver'

export default {
name: "Index",
  data() {
    return {
      tmpFile:"fiv-cla fiv-icon-pdf",
      show:false,
      columns: [
        {
          title: "文件名",
          slot: "name",
        },
        {
          title: "文件类型",
          key: "type",
        },
        {
          title: "文件大小",
          key: "size",
        },
        {
          title: "创建时间",
          key: "created_at",
        },
        {
          title: "操作",
          slot: "action",
        }
      ],
      files: [],
      chunk_size: 1024 * 1024 * 10,
      path: "",

      mkdirModal: false,
      dirName: "",

      uploadModal: false,
      uploads: [],
      forDir: false,
      totalSize: 0,
      doneSize: 0,
      trueUpload: 0,
      uploadPercent: 0,
      uploadSpeed:0,
      uploadError: false,
      uploadLast: 0,
      uploadCir: 0,
      uploadLastTime: 0,

      downModal: false,
      downFile:{name:"",size:0},
      downPercent:0,
      downSize:0,
      downSpeed:0,
      downCancel: false,

      fileContent: "",
      readFileName:"",
      readModal: false,

      pwdCheckModal: false,
      pwd:"",

      reNameFile: null,
      reNameModal: false,
      newName: "",
    }
  },
  methods: {
    handleUpload(file) {
      this.uploads.push(file)
      this.totalSize += file.size
      return false
    },
    toUpload(forDir=false) {
      this.axiosGet("checkLogin",{})
      .then(_ => {
        this.totalSize = this.doneSize = this.trueUpload = this.uploadPercent = this.uploadSpeed = this.uploadCir = this.uploadLast = 0
        this.uploadLastTime = (new Date()).getTime()
        this.forDir = forDir
        this.uploads = []
        this.uploadError = false
        this.uploadModal = true
      })
    },
    upload(url,data,params) { //文件上传
      const CancelToken = this.$axios.CancelToken
      const source = CancelToken.source()
      let last = 0
      let siz = params.size
      this.$axios.post(url,data,{
        headers:{'Content-Type': 'multipart/form-data'},
        params: params,
        cancelToken:source.token,
        onUploadProgress: (e) => {
          if (!this.uploadModal) {
            source.cancel("stop upload")
            return
          }
          if (last < siz) {
            this.doneSize += Math.min(e.loaded,siz) - last
            last = e.loaded
            if (this.uploadCir==0) {
              let now = (new Date()).getTime()
              this.uploadSpeed = ((this.doneSize - this.uploadLast) / (1048.576*(now - this.uploadLastTime))).toFixed(2)
              this.uploadLastTime = now
              this.uploadLast = this.doneSize
            }
            this.uploadCir += 1
            if (this.uploadCir>=20) this.uploadCir = 0
            if (this.doneSize < this.totalSize) {
              this.uploadPercent = Number((this.doneSize/this.totalSize*100).toFixed(2))
            }
          }
        }
      }).then(res=> {
        this.trueUpload += params.size
        if(this.trueUpload >= this.totalSize) {
          this.uploadPercent = 100.00
          setTimeout(()=>{
            alert("上传成功")
            this.uploadModal = false
            this.showDir()
          },1000)
        }
      }).catch(err=>{
        if (this.$axios.isCancel(err)) return
        if(!this.uploadError) {
          this.uploadError = true
          this.uploadModal = false
          alert("上传出错")
        }
      })
    },
    submit() {
      let url = "/submit"
      for(let file of this.uploads) {
        let times = Math.ceil(file.size / this.chunk_size)
        for (let k = 0; k < times; k++) {
          if (this.uploadError || !this.uploadModal) return
          let form = new FormData()
          let blob = file.slice(k * this.chunk_size, (k + 1) * this.chunk_size)
          form.set("blob", blob)
          let params = {"name":this.path + "/" + file.name}
          if(this.forDir) params.name = this.path + "/" + file.webkitRelativePath
          params.offset = k * this.chunk_size
          params.size = blob.size
          this.upload(url, form, params)
        }
      }
    },
    toDownload(row) {
      if(row.is_dir) this.downFile.name = row.name + ".zip"
      else this.downFile.name = row.name
      this.downFile.size = 0
      this.downPercent = this.downSize = 0
      this.downCancel = false
      this.download3(row)
    },
    download(row) {
      let url = "/download";
      let path = this.path + "/" + row.name
      this.$axios({
        url: url,
        method: 'GET',
        responseType: 'blob', // important
        params: {"path":path},
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        if (row.is_dir) link.setAttribute('download','data.zip');
        else link.setAttribute('download', row.name);
        document.body.appendChild(link);
        link.click();
      });
    },
    download3(row) {
      const CancelToken = this.$axios.CancelToken
      const source = CancelToken.source()
      let url = "/download"
      let path = this.path + "/" + row.name
      let lastTime = (new Date()).getTime()
      let last = 0
      let cir = 0
      this.$axios({
        method:"GET",
        url:url,
        params:{'path':path},
        responseType: 'blob',
        cancelToken: source.token,
        onDownloadProgress: (evt) => {
          if(this.downCancel) {
            source.cancel("stop download")
            this.downModal = false
            return
          }
          if (cir==0) {
            let now = (new Date()).getTime()
            this.downSpeed = ((evt.loaded - last) / (1048.576*(now - lastTime))).toFixed(2)
            lastTime = now
            last = evt.loaded
          }
          cir += 1
          if (cir>=20) cir = 0
          this.downPercent = Number((evt.loaded / evt.total　* 100).toFixed(2))
          this.downSize = evt.loaded
          if(!this.downModal) {
            this.downFile.size = evt.total
            this.downModal = true
          }
        }
      }).then(res => {
        let blob = new Blob([res.data],{
          type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
        })
        saveAs(blob,this.downFile.name)
        setTimeout(()=>{
          alert("下载成功")
          this.downModal = false
        },3000)
      }).catch(err => {
        if (this.$axios.isCancel(err)) {
          this.$message("info","已取消")
        }　else  alert("下载出错")
        this.downModal = false
      })
    },
    back() {
      this.path = this.path.substring(0,this.path.lastIndexOf("/"))
      this.showDir()
    },
    backRoot() {
      this.path = ""
      this.showDir()
    },
    showDir(e = "") {
      if (e!="")  this.path += "/" + e;
      this.axiosGet("/showDir",{"path":this.path})
          .then(res => {
            this.files = res
            for (let item of this.files) {
              if (this.path!="") item.staticPath = "/static/" + this.path + "/" + item.name
              else item.staticPath = "/static/"  + item.name
            }
          }).catch(err => {
          this.$message("error",err)
      })
    },
    showDirOrLookUp(row) {
      if(row.is_dir) this.showDir(row.name); else this.lookup(row.name)
    },
    lookup(name) {
      this.axiosGet("/lookup",{"path":this.path+"/"+name})
          .then(res => {
            this.readFileName = name
            this.fileContent = res
            this.readModal = true
          }).catch(err => {
          this.$message("error",err)
      })
    },
    toMkdir() {
      this.axiosGet("checkLogin",{})
      .then(_=>{
        this.mkdirModal = true
      })
    },
    mkdir() {
      this.dirName = this.dirName.trim()
      if(this.dirName=="") {
        this.$message("error","文件夹名不能为空")
        return
      }
      this.axiosGet("/mkdir",{"path":this.path+"/"+this.dirName})
          .then(res => {
            this.$message("success","创建成功")
            this.dirName = ""
            this.showDir()
            this.mkdirModal = false
          }).catch(err => {
        this.$message("error",err)
      })
    },
    deleteFile(name) {
      this.$Modal.confirm({
        title: '确认框',
        content: '<div style="font-size: 18px;color: black"> 你确定要删除 <span style="color: red">' + name + '  </span> 吗?</div>',
        onOk: () => {
          this.axiosGet("/delete",{"path":this.path+"/"+name})
              .then(res => {
                this.$message("success","删除成功")
                this.showDir()
              }).catch(err => {
            this.$message("error",err)
          })
        },
      });
    },
    cancel() {
      this.file = null
    },
    toReName(row) {
      this.reNameFile = row
      this.newName = ""
      this.reNameModal = true
    },
    reName() {
      this.newName = this.newName.trim()
      if (this.newName.length == 0) {
        this.$message("error","文件名不能为空")
        return
      }
      if (this.newName.indexOf("/")!=-1) {
        this.$message("error","文件夹名不能出现 / ")
        return
      }
      if (this.reNameFile.is_dir && this.newName.indexOf(".")!=-1) {
        this.$message("error","文件夹名不能出现 . ")
        return
      }
      this.axiosGet("/reName",{"path":this.path,"orgName":this.reNameFile.name,"newName":this.newName})
      .then(res=> {
          this.$message("success","重命名成功")
          this.reNameModal = false
          this.showDir()
      }).catch(err => {
        this.$message("error",err)
      })
    },
    checkPwd() {
        let form = new FormData()
        form.set("pwd",this.pwd)
        this.$axios.post("checkPwd",form)
        .then(res => {
            this.$message("success","验证成功")
            this.pwdCheckModal = false
            if (!this.show) {
              this.showDir()
              this.show = true
            }
        }).catch(err => {
          this.$message("error",err.response.data)
        })
    },
    axiosGet(url,params) {
      return new Promise((resolve, reject) => {
        this.$axios.get(url,{params:params})
            .then(res => {
              resolve(res.data)
            }).catch(err => {
              if (err.response.status == 401) {
                this.pwdCheckModal = true
              }
          reject(err.response.data)
        })
      })
    },
    autologin() {
      this.axiosGet("checkLogin",{})
      .then(res => {
        this.show = true
        this.showDir()
      })
    },
    getSize(row) {
      if(row.is_dir) return "---"
      if(row.size < 1024) return row.size + " B"
      if(row.size < 1048576) return (row.size/1024).toFixed(2) +" KB"
      if(row.size < 1073741824) return  (row.size/1048576).toFixed(2) +" MB"
      return (row.size/1073741824).toFixed(2) +" MB"
    }
  },
  mounted() {
    this.autologin()
  }
}
</script>

<style scoped>
.div {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}
</style>