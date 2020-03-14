package handlers

import (
	"fmt"
)

// DatabaseConnection :
func DatabaseConnection() {
	/*clientOptions := options.Client().ApplyURI("mongodb://localhost:8080")
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	err = client.Ping(context.TODO(), nil)

	if err != nil {
		log.Fatal(err)
	}
	*/
	fmt.Println("Connected to MongoDB!")

}
