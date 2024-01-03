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
    var body = JSON.parse(JSON.stringify(template));
    body.metadata.name = `devenv-${envName}`
    body.spec.envName = envName
    const res = await k8sApi.createNamespacedCustomObject('dev.tmahesh.com','v1','default', 'devenvironments',body)
    return {status: res.statusCode, envName, message: `open https://api-${envName}.tmahesh.com`}
}

async function deleteEnv(envName) {
    const res = await k8sApi.deleteNamespacedCustomObject('dev.tmahesh.com','v1','default', 'devenvironments',`devenv-${envName}`)
    return res.statusCode
}

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const fs = require('fs')

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
    const envName = /^[a-z0-9]{4,}$/i.test(req.params.envName) ? 
        req.params.envName : res.send('Invalid envName. Shud be 4+ alpha-numeric chars')
    res.send(await createEnv(envName))
})

app.delete('/devenv/:envName', async (req, res) => {
    res.send(await deleteEnv(req.params.envName))
})

//TODO: make this fast return an exisintg env and log request for creating new
//Idea: use label on k8s resorces. If label used=true, then it's in use sthg like that
app.post('/devenv/', async (req, res) => {
    const envName = (Math.random().toString(36)+'00000000000000000').slice(2, 6+2)
    res.send(await createEnv(envName))
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
