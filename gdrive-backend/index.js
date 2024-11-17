const express = require('express')
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis')
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const fs = require('fs')
const process = require('process');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const app = express()

const storage = multer.diskStorage({
    destination:'uploads',
    filename:function(req,file,callback){
        const extension = file.originalname.split(".").pop()
        callback(null,`${file.fieldname}-${Date.now()}.${extension}`)
    }
})

const upload = multer({storage:storage})

app.use(cors())

app.post('/upload', upload.array('uploadFile'), async (req, res) => {
    try{
        let auth = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        const drive = google.drive({version: 'v3', auth});
        const uploadedFiles = []
        const file = req.files[0]
        const response = await drive.files.create({
            requestBody:{
                name:file.originalname,
                mimetype:file.mimetype,
            },media:{
                body:fs.createReadStream(file.path)
            }
        })
        uploadedFiles.push(response.data)
        res.json({files:uploadedFiles})
        console.log("Plik zapisany na dysku")
    }catch (error){
        console.log(error)
    }
})

app.listen(5001, () => {
    console.log("App working")
})