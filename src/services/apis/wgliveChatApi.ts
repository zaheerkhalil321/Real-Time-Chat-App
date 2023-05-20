 

export const 
Api = (visitorId, token) => {

    fetch('https://cors-anywhere.herokuapp.com/https://blue.thelivechatsoftware.com/ChatAppApi/api/wglcs/getvisitoripinformation?visitorId=' + visitorId, {
        "method": "GET",
        "headers": new Headers({
            'access-token': 'pnqxdcABJPkKu0IvtjNvtWqD6iNUxqBaxivBrJwzUfNv4Nbq1S',
            "Authorization": 'Bearer ' + token,
            'accept': 'text/plain',
            'api-version': 'v1'
        }),
    })
        .then(response => response.json())
        .then(response => {
           
        })
        .catch(err => {
           
        });

}
const userSignUpApi = (name, email, password) => {
   
    let obj = {
        "firstName": name,
        "lastName": name,
        "email": email,
        "password": password,
        "confirmPassword": password,
        "facebookId": null,
        "pictureUrl": null
      
    }
    return fetch('http://blue.thelivechatsoftware.com/ChatAppApi/api/auth/authenticate', {
        method: 'POST',
        headers: new Headers({
            'access-token': 'pnqxdcABJPkKu0IvtjNvtWqD6iNUxqBaxivBrJwzUfNv4Nbq1S',
            'callback-url': 'http://localhost:3000/',
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(obj)
    }).then(response => {
       
        return response.json()

    }).catch((error) => {
        console.error('Error:', error);
    });
}
const userLoginApi = (email, password) => {
 
    let obj = {
        "email": email,
        "password": password
    }
    return fetch('http://blue.thelivechatsoftware.com/ChatAppApi/api/auth/authenticate', {
        method: 'POST',
        headers: new Headers({
            'access-token': 'pnqxdcABJPkKu0IvtjNvtWqD6iNUxqBaxivBrJwzUfNv4Nbq1S',
            'callback-url': 'http://localhost:3000/',
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(obj)
    }).then(response => {
    
        return response.json()
    }).catch((error) => {
        console.error('Error:', error);
    });
}
const userLogoutApi = (authToken) => {
     
    return fetch('http://blue.thelivechatsoftware.com/ChatAppApi/api/auth/logoff', {
        mode: 'no-cors',
        method: 'POST',
        headers: new Headers({
            'access-token': 'pnqxdcABJPkKu0IvtjNvtWqD6iNUxqBaxivBrJwzUfNv4Nbq1S',
            'Authorization': `Bearer `+btoa(authToken),
            'Content-Type': 'text/plain'
        })
    })
}
export { userSignUpApi, userLoginApi, userLogoutApi };
