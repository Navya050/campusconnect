const mongoose = require('mongoose')

const postsSchema = mongoose.Schema({
    title: {
     type: String,
     required: true
    },
    content: {
     type: String,
     required: true
    }
   })

   const Posts = mongoose.model('posts', postsSchema)


   module.exports = Posts;
