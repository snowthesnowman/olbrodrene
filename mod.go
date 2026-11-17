package main

import (
	"fmt"

	reversecool "uteliv/priser/Test"

	"golang.org/x/example/hello/reverse"
)

func main() {
	fmt.Println(reverse.String("Hello"), reversecool.Int(24601))
}
