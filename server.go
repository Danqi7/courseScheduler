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
	Number string
	Title string
	Time []string
	Instructor []string
	Date []string
	Seasons []string
}

func parseTimeAndInstructor(content string) (string, string){
	var time, instructor = "", ""
	if c := string(content[0]); c == "<" {
		return time, instructor
	}

	for i, r := range content {
		if c := string(r); c == "<" {
			time = content[:i]
		}
		if c := string(r); c == ">" {
			instructor = content[i+1:len(content)]
		}
	}

	return time, instructor
}

func getDepartmentCourses(url string) {
	// courses := make([]Course, 0)
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
				var number, title = "", ""
				s2.Find("td").Each(func (rowIndex int, s3 *goquery.Selection){
					switch rowIndex {
					case 0:
						number = s3.Find("a").Text()
					case 1:
						title = s3.Find("a").Text()
					case 2:
						inner, _ := s3.Html()
						time, instructor := parseTimeAndInstructor(inner)
						log.Printf("Time: %s, Instructor: %s", time, instructor)
					case 3:
						// winter = s3.Html()
						// log.Printf(s3.Html())
						inner, _ := s3.Html()
						time, instructor := parseTimeAndInstructor(inner)
						log.Printf("Time: %s, Instructor: %s", time, instructor)
					case 4:
						// spring = s3.Html()
						// log.Printf(s3.Html())
						inner, _ := s3.Html()
						time, instructor := parseTimeAndInstructor(inner)
						log.Printf("Time: %s, Instructor: %s", time, instructor)
					}
				})
				// log.Printf("%s %s %s %s %s\n",number, title, fall, winter, spring)
				// course := Course{number, title, time, instructor, }
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
