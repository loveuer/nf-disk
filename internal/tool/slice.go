package tool

import "iter"

func Bulk[T any](slice []T, size int) iter.Seq2[int, []T] {
	if size <= 0 {
		panic("bulk size must be positive")
	}

	s := make([]T, 0, size)
	idx := 0
	return func(yield func(int, []T) bool) {
		for i := range slice {
			s = append(s, (slice)[i])
			if len(s) >= size {

				// send to handle
				ok := yield(idx, s)
				if !ok {
					return
				}

				idx++
				s = make([]T, 0, size)
			}
		}

		if len(s) > 0 {
			yield(idx, s)
		}
	}
}
