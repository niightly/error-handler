let shouldLog = false

let ensureVariables = function(err, res) {
	let isValid = false

	if (!err) { console.log('MISSING_ERROR_OBJECT') }
	else if (typeof err !== 'object' || Array.isArray(err)) { console.log('ERROR_MUST_BE_AN_OBJECT') }
	else if (!res) { console.log('MISSING_EXPRESS_RESPONSE_OBJECT') }
	else { isValid = true }

	return isValid
}

/**
 * Handle all errors to deliver it to the frontend
 */
class ErrorHandler {
	//gets the value stored into the module
	static get print() {
        return shouldLog;
    }

    //sets if module should print the error to the console or not.
    static set print(value) {
    	if (typeof value !== 'boolean') { value = false }
        shouldLog = value
    }

	/**
	 * Will identify the type of the error and deliver it pre formatted to the frontend
	 * @param  {Error} 				err 		The error created on the backend
	 * @param  {Express.Response} 	res 		Express response object
	 * @return {Express.Response}     			With the treated error
	 */
	static toResponse(err, res) {
		if (shouldLog) console.log(err)

		if (!ensureVariables(err, res)) { return }

		if(err.name == 'MongoError' && err.code == 11000) {
			return res.status(400).json({ 
				message: "DUPLICATE_NOT_ALLOWED",
				mongoError: err
			})
		} else if (err.name == 'ValidationError') {
			let errors = {
				required: [],
				message: "REQUIRED_FIELDS_EMPTY",
				mongoError: err
			}

			for (let field in err.errors) {
				if (err.errors[field].kind === 'required') { errors.required.push(field) }
			}

			return res.status(400).json(errors)
		} else if (!err.name) {
			err.name = ""
		}

		switch(err.name.toLowerCase()){
			case 'accessdenied': return res.status(403).json(err)
			case 'unauthorized': return res.status(401).json(err)
			case 'forbidden': return res.status(403).json(err)
			case 'notfound': return res.sendStatus(404)
			case 'alreadyexists': return res.status(400).json(err)
			case 'mongoerror': return res.status(500).json(err)
			case 'typeerror': return res.status(500).json(err.message || err)
			case 'badrequest': return res.status(400).json(err)
			default: return res.status(500).json(err)
		}
	}
}

module.exports = ErrorHandler