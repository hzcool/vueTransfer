import Vue from 'vue';
import 'view-design/dist/styles/iview.css'

import {
    Button,
    Divider,
    Icon,
    Input,
    List,
    Message,
    Modal,
    Progress,
    Upload,
} from 'view-design'
// iview基础模块
const components = {
    Button,
    Divider,
    Icon,
    Input,
    List,
    ListItem: List.Item,
    ListItemMeta: List.Item.Meta,
    Message,
    Modal,
    Progress,
    Upload,
}

const iviewModule = {
    ...components,
    // 不能和html标签重复的组件，添加别名(除了Switch、Circle在使用中必须是iSwitch、iCircle,其他都可以不加"i")
    iButton: Button,
    iInput: Input,
}
// 循环注册全局组件
Object.keys(iviewModule).forEach(key => {
    Vue.component(key, iviewModule[key])
})

const MyMessage = function(type,info) {
    Message[type]({
        background: true,
        content: info
    });
}

Vue.prototype.$Modal = Modal
Vue.prototype.$message = MyMessage