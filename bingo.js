require( 'dotenv' ).config()
const fs = require( 'fs' )

const mongoose           = require( 'mongoose' )
const Sentry             = require( '@sentry/node' )
const cors               = require( 'cors' )
const express            = require( 'express' )
const http               = require( 'http' )
const https              = require( 'https' )
const SocketIo           = require( 'socket.io' )
const twitchextensioncsp = require( 'twitchextensioncsp' )

const Grid = require( './models/Grid' )

const app    = express()
const server = process.env.PRODUCTION
	? https.createServer( app )
	: http.createServer( app )
const io     = new SocketIo.Server( server )

// Sentry.init( {
// 	dsn    : 'https://cb098d4aef4e4ce386fd5e630998314e@sentry.io/5166821',
// 	enabled: ( process.env.NODE_ENV === 'production' )
// } )

mongoose.connect( process.env.DB_URL, {
	authSource        : 'admin',
	user              : process.env.DB_USER,
	pass              : process.env.DB_PSWD,
	useNewUrlParser   : true,
	useUnifiedTopology: true
} )

app.use( express.static( 'public' ) )
// app.use(Sentry.Handlers.requestHandler())
app.use( cors( {
	credentials: true, origin: [
		`https://${process.env.TWITCH_EXTENSION_ID}.ext-twitch.tv`
	]
} ) )
// app.use( ( req, res, next ) => {
// res.append( 'Content-Security-Policy', `script-src ${process.env.TWITCH_EXTENSION_HASH}'` )
// next()
// } )
app.use( twitchextensioncsp( {
	clientID  : process.env.TWITCH_EXTENSION_ID,
	scriptSrc : [
		'https://bingo.twitch.nemephir.com'
	],
	connectSrc: [
		'https://bingo.twitch.nemephir.com',
		'wss://bingo.twitch.nemephir.com'
	]
} ) )

app.post( '/csp/', express.json( {
	type: 'application/csp-report'
} ), ( req, res ) => {
	res.send( 'Ok' )
	console.log( req.body )
} )

io.on( 'connection', async ( socket ) => {
	socket.on( 'grid.load', ( channelId ) => loadGrid( socket, channelId ) )
	socket.on( 'grid.save', ( data ) => saveGrid( socket, data ) )
	socket.on(
		'grid.check',
		( gridId, channelId, cellNumber, checked ) => checkCell( socket, gridId, channelId, cellNumber, checked )
	)
} )

server.listen( Number( process.env.PORT ) )

const loadGrid = async ( socket, channelId ) => {
	socket.join( channelId )
	let one = await Grid.findOne( { channel: channelId } )
	if( ! one )
		one = await Grid.create( { channel: channelId } )

	socket.emit( 'grid', one.toObject() )
}

const saveGrid = async ( socket, data ) => {
	let one = await Grid.findOne( { channel: data.channel, _id: data._id } )
	if( one ) {
		if( data.size )
			one.size = Number( data.size )
		if( data.moderator !== undefined )
			one.moderator = !! data.moderator
		if( data.cells )
			one.cells = data.cells

		await one.save()
		io.to( data.channel ).emit( 'grid', one.toObject() )
	}
}

const checkCell = async ( socket, gridId, channelId, cellNumber, checked ) => {
	let one = await Grid.findOne( { channel: channelId, _id: gridId } )
	if( one ) {
		one.cells[cellNumber].checked = checked
		await one.save()
		console.log( socket.broadcast )
		io.to( channelId ).emit( 'grid', one.toObject() )
	}
}