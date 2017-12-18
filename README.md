# IBM-Error-Handler

This module will work with the error will assign it to the proper code.

## Getting Started

This module were create to help my team work with error messages and it codes without copy and paste the same module all the time.

### Installing

Run `npm i ibm-error-handler --save`

### Documentation
Below follows the details about methods available in this module

#### Constructor
This module requires a parameter when require it. 

| parameter | type    | Description
| ---       | ---     | ---
| `Print`   | Boolean | Tells the module if it should print the error on the terminal, should be the same in all places where the module is used, I recommend a global variable.

#### ErrorHandler.return(err, res, callback)
This method will receive the error with/without the express response, if receives an express response will deliver a status to the front end.

| Params | Value Type | Description |
| ------------ | ------ | --- |
| **err**      | Object | **Required:** The error object to be treated |
| **res**      | Object | **Optional:** The [Express.Response](http://expressjs.com/en/4x/api.html#res) object. |
| **callback** | Object | **Optional:** A callback that will be executed but the error handler. |


### How to Use


##### Controllers
Check the example below to get a better understanding of the module

```javascript
//bellow I check which environment I'm working with based on my environment  
//variables to determine if I want to print the error to the terminal or not.
//But you can do whatever you want, but must be a Boolean
const ErrorHandler = require('ibm-error-handler')(process.env.NODE_ENV!=='prod')

/**
 * Will handle the logins of the application
 */
class Login {
	constructor() { }
  
  //An example of a function executed in when a route is called
	async index(req, res) {
		try {
			let user = await Session.create(req.user)
			res.status(200).json(user)
		} catch (err) {
			ErrorHandler.return(err, res)
		}
	}
}
```

##### Models, services, factories (places that don't use express response)
Check the example below to get a better understanding of the module

```javascript
//bellow I check which environment I'm working with based on my environment  
//variables to determine if I want to print the error to the terminal or not.
//But you can do whatever you want, but must be a Boolean
const ErrorHandler = require('ibm-error-handler')(process.env.NODE_ENV!=='prod')
const Error = ErrorHandler.errors

/**
 * Will handle the logins of the application
 */
class Models {
	constructor() { }
  
  	//An example of a function executed in when a route is called
	index(req, res) {
		try {
			//Any code
		} catch (err) {
			ErrorHandler.return(err)
		}
	}
}
```


## Contributing

This module was based on a function created by my friend [Mateus](https://github.com/mateusnroll), my job was to do some adjustments to ensure it can be used as npm module.

## Authors

* **Night** - *Initial work* - [Niightly](https://github.com/niightly)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
