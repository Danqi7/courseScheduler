package main

import (
	"fmt"
	"net/http"
	"log"
	// "io/ioutil"
	// "golang.org/x/net/html"

	"github.com/PuerkitoBio/goquery"
)

type Course struct {
	Title string
	Start string
	End string
	Instructor string
	Location string
	Date []string
}

func getDepartmentCourses(url string) {
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("A wild error has occured while crawling url %s: %s", url, err)
		return
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromResponse(resp);
	if err != nil {
		log.Fatal(err)
	}

	doc.Find("table").Each(func (i int, s *goquery.Selection) {
		// log.Printf(s.Html())
		s.Find("tbody").Each(func (index int, s1 *goquery.Selection) {
			// log.Printf(s1.Html())

			//find table row
			s1.Find("tr").Each(func (ii int, s2 *goquery.Selection) {
				log.Printf(s2.Html())
				log.Printf("\n")
				s2.Find("td").Each(func (rowIndex int, s3 *goquery.Selection){
					switch rowIndex {
					case 0:
						number := s3.Find("a").Text()
						log.Printf(number)
					case 1:
						title := s3.Find("a").Text()
						log.Printf(title)
					}
				})
			})
		})
	})

	// bytes, err := ioutil.ReadAll(resp.Body)
	// if err != nil {
	// 	log.Printf("Error openning response body: %s", err);
	// }
	//log.Printf("HTML:\n\n%s", string(bytes))
	//log.Printf("resp: \n%v")
	//log.Println(resp.Body)

	// z := html.NewTokenizer(resp.Body)
	// depth := 0
	// for {
	// 	tt := z.Next()
	//
	// 	switch tt {
	// 	case html.ErrorToken:
	// 		return
	// 	case html.TextToken:
	// 		if depth > 0 {
	// 			log.Printf("TEXT: %v", z.Text())
	// 		}
	// 	case html.StartTagToken, html.EndTagToken:
	// 		t := z.Token()
	//
	// 		isTable := t.Data == "table"
	// 		if isTable {
	// 			log.Printf("found the table: %s", t)
	// 			log.Printf("value of table: %v%T", t, t)
	// 		}
	// 		if tt == html.StartTagToken {
	// 			depth++
	// 		} else {
	// 			depth--
	// 		}
	// 	}
	// }
}

func handler(w http.ResponseWriter, r *http.Request) {
	url := "http://www.mccormick.northwestern.edu/eecs/courses/index.html"
	getDepartmentCourses(url);
	fmt.Fprintf(w, "Hi %s", r.URL.Path[1:])
}

func main() {
	http.HandleFunc("/", handler)
	log.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
