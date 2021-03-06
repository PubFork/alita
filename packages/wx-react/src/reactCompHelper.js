import instanceManager from "./InstanceManager";

/**
 * Copyright (c) Areslabs.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export default function reactCompHelper(obj) {
    obj.properties = {
        ...obj.properties,
        diuu: null,
    }

    const rawAttached = obj.attached
    obj.attached = function () {
        const rawData = this.data
        Object.defineProperty(this, 'data', {
            get: function () {

                // 当FlatList SectionList等继承PureComponent/Component组件存在的时候，其销毁是在react过程就完成的
                // 这里detached调用this.data.diuu 会导致这里的compInst为null
                const compInst = instanceManager.getCompInstByUUID(rawData.diuu);
                if (!compInst) {
                    return rawData
                } else {
                    return {
                        ...rawData,
                        ...compInst.props
                    }
                }
            },
        })
        rawAttached && rawAttached.call(this)
        instanceManager.setWxCompInst(this.data.diuu, this)
    }

    const rawDetached = obj.detached
    obj.detached = function () {
        rawDetached && rawDetached.call(this)
        instanceManager.removeUUID(this.data.diuu)
    }

    if (!obj.methods) {
        obj.methods = {}
    }
    obj.methods.getReactComp = function () {
        return instanceManager.getCompInstByUUID(this.data.diuu)
    }

    return obj
}