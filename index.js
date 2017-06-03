let shouldStack = false
let allowedErrors = {
	AccessDenied,
	Unauthorized,
	NotFound,
	AlreadyExists,
	BadRequest,
	Forbidden,
	Unknown
}

/**
 * Handle all errors to deliver it to the frontend
 */
class ErrorHandler {
	constructor(isDevelopment = false) { shouldStack = isDevelopment }
    get errors() { return allowedErrors }

	/**
	 * Will identify the type of the error and deliver it pre formatted to the frontend
	 * @param  {Error} 				err 		The error created on the backend
	 * @param  {Express.Response} 	res 		Express response object
	 * @return {Express.Response}     			With the treated error
	 */
	return(err, res) {
		err = this._defineError(err)

		if (shouldStack == true) { printLog(err) }
		if (!this._ensureVariables(err, res)) { return }

		if (res) {
			switch(err.name.toLowerCase()){
				case 'accessdenied'          : return res.status(403).json(err)
				case 'unauthorized'          : return res.status(401).json(err)
				case 'forbidden'             : return res.status(403).json(err)
				case 'notfound'              : return res.status(404).json(err.message || err)
				case 'alreadyexists'         : return res.status(400).json(err)
				case 'mongoerror'            : return res.status(500).json(err)
				case 'typeerror'             : return res.status(500).json(err.message || err)
				case 'badrequest'            : return res.status(400).json(err)
				case 'fieldsvalidationerror' : return res.status(400).json(err)
				default                      : return res.status(500).json(err)
			}
		} else {
			let Error = this.errors
			let types = Object.keys(Error)

			if (typeof err == "object" && types.indexOf(err.name) >= 0 || (err.name=='MongoError' || err.name=='FieldsValidationError')) {
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
			err = {
				name: "AlreadyExists",
				message: "DUPLICATE_NOT_ALLOWED"
			}

			if (shouldStack) { err.stack = err }
		} else if (err.name == 'ValidationError') {
			let errors = {
				name: 'FieldsValidationError',
				required: [],
				message: "REQUIRED_FIELDS_EMPTY",
			}

			for (let field in err.errors) {
				if (err.errors[field].kind === 'required') { errors.required.push(field) }
			}

			if (shouldStack) { errors.stack = err }
			return errors
		} else if (!err.name) {
			err.name = ""
		}

		return err
	}
}

/**
 * Prints teh error in a way more readable
 * @param  {Error} err The error created on the server
 */
function printLog(err) {
	if (err.stack == undefined) { return }
	console.log('######### ERROR LOG ##########')
	console.log('  - Name: ', err.name)
	console.log('  - message: ', err.message)
	console.log('  - Error: ')

	if (err.stack && Array.isArray(err.stack) && err.stack.length >= 0) {
		for (const entry of err.stack) {
			if (entry.trim() != 'Error') { console.log('       ', entry) }
		}
	} else {
		console.log(err.stack)
	}
	console.log('##############################')
}

/**
 * Will remove the stack that points to this module instead the file that created it.
 * @param  {String/Object} stack 		The Stack of errors
 * @return {Array}        				The stack splittd into an array
 */		
function _createErrorStack(err) {
	if (!shouldStack) { return }

	let stack = (err) ? err.stack : (new Error()).stack
	if (!stack || typeof stack !== "string") { return stack }
	
	let tmpStack = stack.split('\n')
	if (Array.isArray(tmpStack) && tmpStack.length > 0) {
		tmpStack = tmpStack.reduce(function(newStack, stackEntry) {
			if (stackEntry.indexOf("ibm-error-handler") < 0) { newStack.push(stackEntry) }
			return newStack
		}, [])
	}

	return tmpStack.map(entry => entry.trim())
}

/**
 * User is trying to access a resource he does not have permission to
 * @param {string} message A custom message to overwrite the default one
 * 
 */
function AccessDenied(message) {
	this.name = 'AccessDenied'
	this.message = message || 'ACCESS_DENIED'
	this.stack = _createErrorStack()
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
	this.stack = _createErrorStack()
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
	this.stack = _createErrorStack()
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
	this.stack = _createErrorStack()
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
	this.stack = _createErrorStack()
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
	this.stack = _createErrorStack()
}
Forbidden.prototype = Object.create(Error.prototype)
Forbidden.prototype.constructor = Forbidden

/**
 * For non predicted errors
 * @param {string} message A custom message to overwrite the default one
 */
function Unknown(error) {
	this.name = 'Unknown'
	this.message = "UNKNOWN_ERROR"
	this.stack = _createErrorStack(error)
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