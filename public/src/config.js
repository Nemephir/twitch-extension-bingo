const socket = io('https://bingo.twitch.nemephir.com')
const twitch = window.Twitch.ext

let formInited = false
let channelId  = undefined
let userId     = undefined

window.onload = () => {
	socket.on( 'grid', initGrid )
	twitch.onContext( initTwitchContext )
	twitch.onAuthorized( initTwitchAuthorized )
}

const initTwitchContext = ( context ) => {
	// console.log( context )
}

const initTwitchAuthorized = ( auth ) => {
	channelId = auth.channelId
	userId    = auth.userId
	socket.emit( 'grid.load', channelId )
}

const initGrid = ( gridData ) => {
	let grid = new Grid( true )
		.setId( gridData._id )
		.setChannel( gridData.channel )
		.setSize( gridData.size )
		.setModerator( gridData.moderator )
		.setCells( gridData.cells )
		.render()

	if( !formInited ) {
		// Size Settings
		const sizeSettingEl = document.getElementById( 'sizeSetting' )
		sizeSettingEl.value = grid.size
		sizeSettingEl.addEventListener( 'input', () => {
			grid.setSize( Number( sizeSettingEl.value ) )
				.render()
		} )

		// Moderator settings
		// const moderatorSettingEl   = document.getElementById( 'moderatorSetting' )
		// moderatorSettingEl.checked = grid.moderator
		// moderatorSettingEl.addEventListener( 'change', () => {
		//     grid.setModerator( moderatorSettingEl.checked )
		// } )

		// Save button
		const saveEl = document.getElementById( 'saveButton' )
		saveEl.addEventListener( 'click', () => {
			let data = {
				_id      : grid.id,
				channel  : gridData.channel,
				size     : grid.size,
				moderator: grid.moderator,
				cells    : grid.cells
			}
			socket.emit( 'grid.save', data )
		} )

		formInited = true
	}
}