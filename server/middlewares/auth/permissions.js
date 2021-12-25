module.exports = {

        // Permissions for the user type (1) means admin
        1 : [
            { 'method' : 'post' , 'api' : '/users' , 'allowed' : true },
        ],

        // Permissions for the user type (2) means dealers
        2 : [
            { 'method' : 'GET' , 'api' : '/users/:number/:number' , 'allowed' : true },
        ]
};