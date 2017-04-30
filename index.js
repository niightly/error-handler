let allowedErrors = {
	AccessDenied  : AccessDenied,
	Unauthorized  : Unauthorized,
	NotFound      : NotFound,
	AlreadyExists : AlreadyExists,
	BadRequest    : BadRequest,
	Forbidden     : Forbidden,
	Unknown       : Unknown
}

/**
 * Handle all errors to deliver it to the frontend
 */
class ErrorHandler {
	constructor(shouldLog = false) {
		this.shouldLog = shouldLog
	}

    get errors() { return allowedErrors }

	/**
	 * Will identify the type of the error and deliver it pre formatted to the frontend
	 * @param  {Error} 				err 		The error created on the backend
	 * @param  {Express.Response} 	res 		Express response object
	 * @return {Express.Response}     			With the treated error
	 */
	return(err, res) {
		if (this.shouldLog===true) { console.log(err) }
		if (!this._ensureVariables(err, res)) { return }

		err = this._defineError(err)

		if (res) {
			switch(err.name.toLowerCase()){
				case 'accessdenied'    : return res.status(403).json(err)
				case 'unauthorized'    : return res.status(401).json(err)
				case 'forbidden'       : return res.status(403).json(err)
				case 'notfound'        : return res.status(404).json(err.message || err)
				case 'alreadyexists'   : return res.status(400).json(err)
				case 'mongoerror'      : return res.status(500).json(err)
				case 'typeerror'       : return res.status(500).json(err.message || err)
				case 'badrequest'      : return res.status(400).json(err)
				case 'ValidationError' : return res.status(400).json(err)
				default                : return res.status(500).json(err)
			}
		} else {
			let Error = this.errors

			let types = Object.keys(Error)
			if (typeof err == "object" && types.indexOf(err.name) >= 0) {
				throw err
			} else {
				throw new Error.Unknown(err)
			}
		}
	}

	/**
	 * Will validate if the required params have been passed to the module
	 * @param  {Error} 				err 		The error created on the backend
	 * @param  {Express.Response} 	res 		Express response object
	 * @return {boolean}     					True, if both are passed / false if misses one / both
	 */
	_ensureVariables(err, res) {
		let isValid = false

		if (!err) { console.log('MISSING_ERROR_OBJECT') }
		else { isValid = true }

		return isValid
	}

	/**
	 * Will Try to identify the error before define the error type
	 * @param  {Error} err 	The error
	 * @return {Error}     	The error identified as mongo error or just the error
	 */
	_defineError(err) {
		if(err.name == 'MongoError' && err.code == 11000) {
			return {
				name: "AlreadyExists",
				message: "DUPLICATE_NOT_ALLOWED",
				mongoError: err
			}
		} else if (err.name == 'ValidationError') {
			let errors = {
				name: 'ValidationError',
				required: [],
				message: "REQUIRED_FIELDS_EMPTY",
				mongoError: err
			}

			for (let field in err.errors) {
				if (err.errors[field].kind === 'required') { errors.required.push(field) }
			}

			return errors
		} else if (!err.name) {
			err.name = ""
		}

		return err
	}
}

/**
 * User is trying to access a resource he does not have permission to
 * @param {string} message A custom message to overwrite the default one
 * 
 */
function AccessDenied(message) {
	this.name = 'AccessDenied'
	this.message = message || 'ACCESS_DENIED'
	this.stack = (new Error()).stack
}
AccessDenied.prototype = Object.create(Error.prototype)
AccessDenied.prototype.constructor = AccessDenied

/**
 * User trying to login has no permission to do so
 * @param {string} message A custom message to overwrite the default one
 */
function Unauthorized(message) {
	this.name = 'Unauthorized'
	this.message = message || 'UNAUTHORIZED'
	this.stack = (new Error()).stack
}
Unauthorized.prototype = Object.create(Error.prototype)
Unauthorized.prototype.constructor = Unauthorized

/**
 * Not found on bluepages
 * @param {string} message A custom message to overwrite the default one
 */
function NotFound(message) {
	this.name = 'NotFound'	
	this.message = message || 'NOT_FOUND'
	this.stack = (new Error()).stack
}
NotFound.prototype = Object.create(Error.prototype)
NotFound.prototype.constructor = NotFound

/**
 * Attempt to create something that already exists
 * @param {string} message A custom message to overwrite the default one
 */
function AlreadyExists(message) {
	this.name = 'AlreadyExists'	
	this.message = message || 'ALREADY_EXISTS'
	this.stack = (new Error()).stack
}
AlreadyExists.prototype = Object.create(Error.prototype)
AlreadyExists.prototype.constructor = AlreadyExists

/**
 * User trying to execute an API with invalid parameters
 * @param {string} message A custom message to overwrite the default one
 */
function BadRequest(message) {
	this.name = 'BadRequest'
	this.message = message || 'BAD_REQUEST'
	this.stack = (new Error()).stack
}
BadRequest.prototype = Object.create(Error.prototype)
BadRequest.prototype.constructor = BadRequest

/**
 * User trying to perform an action he has no permission to
 * @param {string} message A custom message to overwrite the default one
 */
function Forbidden(message) {
	this.name = 'Forbidden'
	this.message = message || 'ACCESS_FORBIDDEN'
	this.stack = (new Error()).stack
}
Forbidden.prototype = Object.create(Error.prototype)
Forbidden.prototype.constructor = Forbidden

/**
 * For non predicted errors
 * @param {string} message A custom message to overwrite the default one
 */
function Unknown(error) {
	error = (error) ? error.stack : (new Error()).stack

	this.name = 'Unknown'
	this.message = "UNKNOWN_ERROR"
	this.stack = error
}
Unknown.prototype = Object.create(Error.prototype)
Unknown.prototype.constructor = Unknown

/**
 * Allow to return the module instantiated without using new when require the module.
 */
function instantiate(shouldLog) {
  	return new ErrorHandler(shouldLog)
}

module.exports = instantiate