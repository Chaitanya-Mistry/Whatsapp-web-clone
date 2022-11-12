import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    channelUsers: [{
        email: { type: String, default: "" },
        name: { type: String, default: "" },
        profilePic: { type: String, default: "" },
    }],
    messages: [{
        senderEmail: { type: String, default: "" },
        message: { type: String, default: "" },
        addedOn : {type: Number, default: new Date().getTime()}
    }],
    addedOn: {
        type: Number,
        default: Date.now()
    }
});

// Methods 
channelSchema.method({
    saveData: async function () {
        return await this.save();
    }
});

// Static methods
channelSchema.static({
    findData: function (findObj) {
        return this.find(findObj);
    },
    findOneData: function (findOneObj) {
        return this.findOne(findOneObj);
    },
    findOneDataAndUpdate: function (findObj, updateObj) {
        return this.findOneAndUpdate(findObj, updateObj, {
            upsert: true,
            setDefaultsOnInsert: true
        });
    }
});

export default mongoose.model('channel', channelSchema);