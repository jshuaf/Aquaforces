module.exports = {
	port: process.argv.includes('--production') ? 80 : 3000,
	// MongoDB remote ip: 146.148.33.112
	mongoPath: `mongodb://${process.env.mongoServer || 'localhost:27017'}/Aquaforces`,
	googleAuth: {
		clientID: process.argv.includes('--test') ?
			'' : '891213696392-0aliq8ihim1nrfv67i787cg82paftg26.apps.googleusercontent.com',
		clientSecret: process.argv.includes('--test') ? '' : 'sW_Qt7Lj63m5Bshun_kdnJvt',
	},
	quizlet: {
		clientID: 'bSjSaTt8tZ',
	},
};
