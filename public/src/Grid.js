class Grid {

	updatingMode = false
	settings     = {
		size: 3
	}
	cells        = [
		{
			content: 'Test 1',
			checked: false
		},
		{
			content: 'Test 2',
			checked: false
		},
		{
			content: 'Test 3',
			checked: false
		},
		{
			content: 'Test 4',
			checked: true
		},
		{
			content: 'Test 5',
			checked: false
		},
		{
			content: 'Test 6',
			checked: false
		},
		{
			content: 'Test 7',
			checked: false
		},
		{
			content: 'Test 8',
			checked: false
		},
		{
			content: 'Test 9',
			checked: false
		}
	]

	constructor( enabledUpdatingMode = false ) {
		this.updatingMode = enabledUpdatingMode
		this.render()
	}

	getSetting( key, defaultValue = null ) {
		return this.settings[key] !== undefined
			? this.settings[key]
			: defaultValue
	}

	setSetting( key, value ) {
		switch( key ) {
			case 'size':
				this.setCellsNumber( value, this.settings[key] )
				break
		}
		this.settings[key] = value
		this.render()
	}

	setCellsNumber( newValue, oldValue ) {
		if( newValue > oldValue ) {
			let delta = newValue - oldValue

			for( let r = 0 ; r < oldValue ; r++ ) {
				for( let i = 0 ; i < delta ; i++ ) {
					this.cells.splice( r*newValue+oldValue, 0, this.getDefaultCell() )
				}
			}

			for( let i = 0 ; i < newValue * delta ; i++ ) {
				this.cells.push( this.getDefaultCell() )
			}
		}
		else {
			let delta = oldValue - newValue

			for( let r = 0 ; r < oldValue ; r++ ) {
				this.cells.splice( r*newValue+newValue, delta )
			}

			this.cells.splice( newValue*newValue, delta*oldValue )
		}
	}

	resetHtml() {
		// Get DOM element
		let gridEl       = this.getElement()
		// Reset class
		gridEl.className = 'grid'
		// Removing childrens
		while( gridEl.childNodes.length > 0 ) {
			gridEl.removeChild( gridEl.childNodes[0] )
		}
	}

	render() {
		const size   = this.getSetting( 'size', 3 )
		const gridEl = this.getElement()

		// reset grid
		this.resetHtml()

		// Broadcaster : add "updatable" css class
		if( this.isBroadcaster() )
			gridEl.classList.add( 'updatable' )

		// For each rows
		for( let rowIndex = 0 ; rowIndex < size ; rowIndex++ ) {
			// Create DOM row and add to grid
			let row = this.createRowHtml()
			gridEl.appendChild( row )

			// For each cells in row
			for( let cellIndex = 0 ; cellIndex < size ; cellIndex++ ) {
				// Calculate row value
				let cellNumber = rowIndex * size + cellIndex
				// Create DOM cell and add to row
				row.appendChild( this.createCellHtml( cellNumber ) )
			}
		}
	}

	createRowHtml() {
		let row = document.createElement( 'div' )
		row.classList.add( 'row' )
		return row
	}

	createCellHtml( cellNumber ) {
		const { checked, content } = this.cells[cellNumber]

		// Create cell and add text content
		let cell = document.createElement( 'div' )
		cell.classList.add( 'cell' )

		if( this.updatingMode ) {
			let textarea   = document.createElement( 'textarea' )
			textarea.value = content
			cell.appendChild( textarea )
		}
		else {
			cell.innerText = content

			// If cell is already checked : add "checked" css class
			if( checked )
				cell.classList.add( 'checked' )

			// If broadcaster : can click on cell to toggle checked value
			if( this.isBroadcaster() ) {
				cell.addEventListener( 'click', () => {
					this.cells[cellNumber].checked = ! checked
					this.render()
				} )
			}
		}

		// Return cell element
		return cell
	}

	getElement( cellNumber ) {
		return document.getElementById( 'grid' )
	}

	getDefaultCell() {
		return {
			content: '--',
			checked: false
		}
	}

	getUserRole() {
		return window.Twitch.ext.viewer.role
	}

	isBroadcaster() {
		return this.getUserRole() === 'broadcaster'
	}

}