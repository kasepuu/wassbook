const host = `http://${window.location.hostname}:8081`
// console.warn(`${host}/groups`);

export const getGroups = async () => {
    const response = await fetch(`${host}/groups`);

    switch (response.status) {
        case 200:
            let groups = await response.json();
            return groups;
        case 401:
            console.log("ERR");
    }
}

export const getGroup = async (id) => {
    const response = await fetch(`${host}/group/${id}`);

    switch (response.status) {
        case 200:
            let group = await response.json();
            return group;
        case 401:
            console.log("ERR");
    }
}

export const createGroup = async (data) => {
    let user = JSON.parse(sessionStorage.getItem("CurrentUser"))
    data.OwnerId = +user.UserID
    console.log(user)

    const response = await fetch(`${host}/creategroup`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return response

}