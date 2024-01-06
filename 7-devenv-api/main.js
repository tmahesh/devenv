const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi)

const template = {
    apiVersion: 'dev.tmahesh.com/v1',
    kind: 'DevEnvironment',
    metadata: {
        name: 'devenv-a1b2c4'
    },
    spec: {
        envName: 'a1b2c4'
    }
}

async function getEnvs() {
    const res = await k8sApi.listNamespacedCustomObject('dev.tmahesh.com','v1','default', 'devenvironments')
    envs = res.body.items.map(devenv => `${devenv.metadata.name} | ${devenv.spec.envName} | ${devenv.metadata.creationTimestamp}`)
    return envs //JSON.stringify(envs,null,2)
}

async function createEnv(envName) {
    var body = JSON.parse(JSON.stringify(template)); //create a copy
    body.metadata.name = `devenv-${envName}`
    body.spec.envName = envName
    const res = await k8sApi.createNamespacedCustomObject('dev.tmahesh.com','v1','default', 'devenvironments',body)
    return res.statusCode
}

async function deleteEnv(envName) {
    const res = await k8sApi.deleteNamespacedCustomObject('dev.tmahesh.com','v1','default', 'devenvironments',`devenv-${envName}`)
    return res.statusCode
}

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

app.use(morgan('combined'))
app.use(cors())

app.get('/', (req, res) => {
  res.send('GET /devenv, POST /devenv/a1b2c3, DELETE /devenv/a1b2c3')
})

app.get('/devenv', async (req, res) => {
  res.send(await getEnvs())
})

app.post('/devenv/:envName', async (req, res) => {
    const envName = /^[a-z][a-z0-9]{3,}$/i.test(req.params.envName) ? 
        req.params.envName : res.send('Invalid envName. Shud match ^[a-z][a-z0-9]{3,}$ ')
    processCreateEnv(envName,res)
})

app.delete('/devenv/:envName', async (req, res) => {
    res.send(await deleteEnv(req.params.envName))
})

//TODO: make this fast return an exisintg env and log request for creating new
//Idea: use label on k8s resorces. If label used=true, then it's in use sthg like that
app.post('/devenv/', async (req, res) => {
    //first cahracter should be a-z, no digits
    const envName = 'm'+(Math.random().toString(36)+'00000000000000000').slice(2, 4+2)
    processCreateEnv(envName,res)
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

async function processCreateEnv(envName,res) {
    statusCode = await createEnv(envName)
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.write(`{envName: "${envName}"}\n`)
    envStatus = await watch(envName,res)
    if(envStatus != "ready"){
        res.write(`{status: "Error in creating ${envName}"}\n`)
        res.end()
        return    
    }
    res.write(`{envStatus: "${envStatus}"}\n`)
    res.write(`{api:     "https://api-${envName}.tmahesh.com"}\n`)
    res.end()
}

function prettyPrintStatus(conditions) {
    let c = conditions.map(c => `{status: "${c.type.padEnd(20)} | ${c.status.padEnd(7)} | ${c.lastTransitionTime} | ${c.message?c.message:''}"}`)
    return c.join('\n')
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const k8sWatch = new k8s.Watch(kc);
async function watch(envName,res){
    let watchReq
    p1  = new Promise(async (resolve, reject) => {
        watchReq = await k8sWatch.watch(
            '/api/v1/namespaces/default/pods',
            // optional query parameters can go here.
            {
                //allowWatchBookmarks: true,
                labelSelector: `app.kubernetes.io/name=${envName}`,
            },
            // callback is called for each received object.
            (type, apiObj, watchObj) => {
                if (apiObj?.status?.conditions){
                    res.write(prettyPrintStatus(apiObj.status.conditions)+'\n{status: "============="}\n')
                }else{
                    res.write('{status: "Processing"}\n')
                }
                if(apiObj?.status?.conditions?.some(c => c.type == "Ready" && c.status == "True")){
                    resolve("ready")
                }
        },
        // done callback is called if the watch terminates normally
        (err) => {
            if(err.code != "ECONNRESET"){
                errString = JSON.stringify(err)
                console.error(`Error from done callback of watch ${errString}`)
                res.write(errString+'\n')
                reject("watch error")
            }
        }
     )
    })

    let timeOutId
    p2 =  new Promise((resolve,reject) => timeOutId = setTimeout(resolve,3*60*1000,"timeout")); //3 minutes
    
    value = await Promise.race([p1, p2]).catch(err => console.error(`Promise Reject for ${envName}: ${err}`))

    console.log(`Promise settled for ${envName}: ${value}`)
    watchReq.abort()
    clearTimeout(timeOutId)
    return value
}
