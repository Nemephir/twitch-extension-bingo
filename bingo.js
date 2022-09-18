require( 'dotenv' ).config()
const fs = require( 'fs' )

const mongoose = require( 'mongoose' )
const express  = require( 'express' )
const http     = require( 'http' )
const SocketIo = require( 'socket.io' )

const Grid = require( './models/Grid' )

const app    = express()
const server = http.createServer( app )
const io     = new SocketIo.Server( server )

mongoose.connect( process.env.DB_URL, {
	authSource        : 'admin',
	user              : process.env.DB_USER,
	pass              : process.env.DB_PSWD,
	useNewUrlParser   : true,
	useUnifiedTopology: true
} )

app.use( express.static( 'public' ) )

io.on( 'connection', async ( socket ) => {
	socket.on( 'grid.load', ( channelId ) => loadGrid( socket, channelId ) )
	socket.on( 'grid.save', ( gridId, channelId, data ) => saveGrid( socket, gridId, channelId, data ) )
} )

server.listen( Number( process.env.PORT ) )

const loadGrid = async ( socket, channelId ) => {
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
		if( data.cells )
			one.cells = data.cells

		await one.save()
		socket.broadcast.emit( 'grid', one.toObject() )
	}
}