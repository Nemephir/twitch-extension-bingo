require( 'dotenv' ).config()
const fs = require( 'fs' )

const mongoose = require( 'mongoose' )
const cors     = require( 'cors' )
const express  = require( 'express' )
const https    = require( 'https' )
const http     = require( 'http' )
const SocketIo = require( 'socket.io' )

const Grid = require( './models/Grid' )

console.log( 'PRODUCTION', process.env.PRODUCTION )

const app    = express()
const server = process.env.PRODUCTION
	? https.createServer( app )
	: http.createServer( app )
const io     = new SocketIo.Server( server )

mongoose.connect( process.env.DB_URL, {
	authSource        : 'admin',
	user              : process.env.DB_USER,
	pass              : process.env.DB_PSWD,
	useNewUrlParser   : true,
	useUnifiedTopology: true
} )

app.use( cors( {
	credentials: true,
	origin     : `https://${process.env.TWITCH_EXTENSION_ID}.ext-twitch.tv`
} ) )

app.get( '/', ( req, res ) => {
	res.send( 'ok' )
} )

io.on( 'connection', async ( socket ) => {
	socket.on( 'grid.load', ( channelId ) => loadGrid( socket, channelId ) )
	socket.on( 'grid.save', ( data ) => saveGrid( socket, data ) )
	socket.on(
		'grid.check',
		( gridId, channelId, cellNumber, checked ) => checkCell( socket, gridId, channelId, cellNumber, checked )
	)
} )

server.listen( Number( process.env.PORT ), (err) => {
	if( err ) console.log(err)
	else console.log( `Listen on  port ${process.env.PORT}` )
} )

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