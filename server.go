package main

import (
	"fmt"
	"net/http"
	"log"
)

type Course struct {
	Title string
	Start string
	End string
	Instructor string
	Location string
	Date []string
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hi %s", r.URL.Path[1:])
}

func main() {
	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

