package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

// User :
type User struct {
	Username string
}

func main() {

	r := mux.NewRouter()
	r.HandleFunc("/connect", connectionHandler).Methods("POST")
	http.ListenAndServe(":8080", r)

}

func connectionHandler(w http.ResponseWriter, r *http.Request) {

	r.ParseForm()
	token := r.FormValue("token")
	sendTokenToAuthenticationService(token, r)

}

func sendTokenToAuthenticationService(token string, r *http.Request) {
	apiURL := "http://localhost:3000"
	resource := "/resolve/"
	data := url.Values{}
	data.Set("token", token)

	u, _ := url.ParseRequestURI(apiURL)
	u.Path = resource
	urlStr := u.String()

	req, err := http.NewRequest("POST", urlStr, strings.NewReader(data.Encode()))
	if err != nil {
		fmt.Println("Request couldn't send.")
	}
	server2serverkey, err := ioutil.ReadFile("server2serverAuth.key")
	if err != nil {
		fmt.Println("File reading error", err)
		return
	}

	req.Header.Set("x-server-auth-key", string(server2serverkey))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Content-Length", strconv.Itoa(len(data.Encode())))

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		fmt.Println("Client error : ", err)
	}
	if res.StatusCode == 200 {
		fmt.Println("Token is true. Autherization completed.")
	} else {
		fmt.Println("Token is wrong. Permission denied.")
	}
	var user User
	err = json.NewDecoder(res.Body).Decode(&user)
	if err != nil {
		fmt.Println("Decoder error : ", err)
	}
	fmt.Println(user)

}
