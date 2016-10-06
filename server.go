package main

import (
	"fmt"
	"encoding/json"
	"net/http"
	"log"
	"time"
	"io/ioutil"
	"sync"
	"os"
	"io"
	"bytes"
	// "golang.org/x/net/html"

	"github.com/PuerkitoBio/goquery"
)

type Course struct {
	Number string `json:"number"`
	Title string `json:"title"`
	Time string `json:"time"`
	Instructor string `json:"instructor"`
}

const dataFile = "./courses.json"

var courseMutex = new(sync.Mutex)

/* determines which quater the courses should load for*/
func whichQuarter() int {
	fall := 0
	winter := 1
	spring := 2

	monthMap := map[string]int{
		"January": 1,
		"February": 2,
		"March": 3,
		"April": 4,
		"May": 5,
		"June": 6,
		"July": 7,
		"August": 8,
		"September": 9,
		"October": 10,
		"November": 11,
		"December": 12,
	}

	month := time.Now().Month().String()
	monthNum := monthMap[month]

	if monthNum >= 9 && monthNum <= 12 {
		return winter
	}

	if monthNum >=1 && monthNum <= 3 {
		return spring
	}

	return fall
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
	courses := make([]Course, 0)
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("A wild error has occured while crawling url %s: %s", url, err)
		return
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromResponse(resp);
	if err != nil {
		log.Fatal("A wild error has occured while parsing the DOM :%s", err)
	}
	var course Course;
	var number, title, time, instructor = "", "", "", ""
	quarter := whichQuarter()
	log.Println(quarter);
	doc.Find("table").Each(func (i int, s *goquery.Selection) {
		// log.Printf(s.Html())
		s.Find("tbody").Each(func (index int, s1 *goquery.Selection) {
			// log.Printf(s1.Html())
			//find table row
			s1.Find("tr").Each(func (ii int, s2 *goquery.Selection) {
				s2.Find("td").Each(func (rowIndex int, s3 *goquery.Selection){
					switch rowIndex {
					case 0:
						number = s3.Find("a").Text()
					case 1:
						title = s3.Find("a").Text()
					case 2:
						if quarter == 0 {
							inner, _ := s3.Html()
							time, instructor = parseTimeAndInstructor(inner)
							//log.Printf("Time: %s, Instructor: %s", time, instructor)
						}
					case 3:
						if quarter == 1 {
							inner, _ := s3.Html()
							time, instructor = parseTimeAndInstructor(inner)
							//log.Printf("Time: %s, Instructor: %s", time, instructor)
						}
					case 4:
						if quarter == 2 {
							inner, _ := s3.Html()
							time, instructor = parseTimeAndInstructor(inner)
							//log.Printf("Time: %s, Instructor: %s", time, instructor)
						}
					}
				})

				course = Course{number, title, time, instructor}
				log.Println(course)
				courses = append(courses, course)
			})

		})
	})

	log.Println(len(courses))
	log.Printf("%v", courses)

	coursesData, err := json.MarshalIndent(courses, "", "	")
	if err != nil {
		log.Fatal("A wild error has occured while marshal course data to json")
	}

	err = ioutil.WriteFile(dataFile, coursesData, 0644);
	if err != nil {
		log.Fatal("A wild error has occured while WriteFile")
	}

	// bytes, err := ioutil.ReadAll(resp.Body)
	// if err != nil {
	// 	log.Printf("Error openning response body: %s", err);
	// }
	//log.Printf("HTML:\n\n%s", string(bytes))
	//log.Printf("resp: \n%v")
	//log.Println(resp.Body)

}

func handleCourses(w http.ResponseWriter, r *http.Request) {

	//since multiple request can come in at once, have a lock around file operation
	courseMutex.Lock()
	defer courseMutex.Unlock()

	_, err := os.Stat(dataFile)
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to stat the data file (%s): %s", dataFile, err), http.StatusInternalServerError)
		return
	}

	courseData, err := ioutil.ReadFile(dataFile)
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to read the date file (%s): %s", dataFile, err), http.StatusInternalServerError)
		return
	}

	if r.Method == "GET" {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		io.Copy(w, bytes.NewReader(courseData))
	} else {
		//don't know the method, error
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}

	log.Println("handleCourses is called...")
}

func handler(w http.ResponseWriter, r *http.Request) {
	// url := "http://www.mccormick.northwestern.edu/eecs/courses/index.html"
	// getDepartmentCourses(url);
	fmt.Fprintf(w, "Hi %s", r.URL.Path[1:])
}

func main() {
	http.HandleFunc("/api/courses", handleCourses)
	http.HandleFunc("/", handler)
	log.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
