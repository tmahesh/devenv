const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi)

randName = (Math.random().toString(36)+'00000000000000000').slice(2, 6+2)
const template = {
    apiVersion: 'dev.tmahesh.com/v1',
    kind: 'DevEnvironment',
    metadata: {
        name: `devenv-${randName}`
    },
    spec: {
        envName: `${randName}`
    }
}

const test = async () => {
    let res

    res = await k8sApi.listNamespacedCustomObject('dev.tmahesh.com','v1','default', 'devenvironments')
    res.body.items.forEach(devenv => console.log(`${devenv.metadata.name} | ${devenv.spec.envName} | ${devenv.metadata.creationTimestamp}}`))
    //res.body.items.forEach(devenv => console.log(JSON.stringify(devenv)))

    // res = await k8sApi. createNamespacedCustomObject('dev.tmahesh.com','v1','default', 'devenvironments',template)
    // console.log(JSON.stringify(res.body,null,2))

    // res = await k8sApi. deleteNamespacedCustomObject('dev.tmahesh.com','v1','default', 'devenvironments',"devenv-a1b2c3")
    // console.log(JSON.stringify(res.body,null,2))

};
test().catch(console.error); 
