package reverse

import (
	"strconv"

	"golang.org/x/example/hello/reverse"
)

func Int(i int) int {
	i, _ = strconv.Atoi(reverse.String(strconv.Itoa(i)))
	return i
}
