const {
	Schema,
	model
} = require("mongoose");

const schema = new Schema({
	discordId: {
		type: String,
		required: true,
		unique: true
	},
  discordName: {
		type: String,
		required: true
	},
  accessToken: {
    type: String,
    required: true,
  },
	refreshToken: {
    type: String,
    required: true,
  },
	guilds: {
		type: Array,
		required: true,
	}
});

module.exports = model('User', schema);
