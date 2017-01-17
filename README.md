# IBM-Error-Handler

This module will work with the error will assign it to the proper code.

## Getting Started

This module were create to help my team work with error messages and it codes without copy and paste the same module all the time.

### Installing

Run `npm i ibm-error-handler --save`

### Documentation
Below follows the details about methods available in this module

#### ErrorHandler.print = false
This method is used to determine if the error object should be print to the terminal/console.

| Value Type | Description |
| --- | --- |
| Boolean | **Required:** If true, will prints the error, won't if false. *(default: false)* |

#### ErrorHandler.exec(err, res)
This method will receive the error and the express response, assign the error according it's code.

| Params | Value Type | Description |
| --- | --- | --- |
| **err** | Object | **Required:** The error object to be treated |
| **res** | Object | **Required:** The [Express.Response](http://expressjs.com/en/4x/api.html#res) object. |


### How to Use
Check the example below to get a better understanding of the module
```javascript
const ErrorHandler = require('error-handler')

//bellow I check which environment I'm working with based on my environment variables to determine if I want to 
//print the error to the terminal or not. But you can do whatever you want, just need to know value to assign must
//be a Boolean
ErrorHandler.print = (!process.env.NODE_ENV || process.env.NODE_ENV == 'development') ? true : false

/**
 * Will handle the logins of the application
 */
class Login {
	constructor() { }
  
  //An example of a function executed in when a route is called
	index(req, res) {
		Session.create(req.user)
		.then(user => Session.mapUserData(user, user.token))
		.then(result => res.status(200).json(result))
		.catch(err => ErrorHandler.exec(err, res))
	}
}
```


## Contributing

This module was based on a function created by my friend [Mateus](https://github.com/mateusnroll), my job was to do some adjustments to ensure it can be used as npm module.

## Authors

* **Night** - *Initial work* - [Niightly](https://github.com/niightly)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details