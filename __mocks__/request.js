export default function request(callback) {
	return callback(null, null, JSON.stringify({ a: 'b' }));
}
