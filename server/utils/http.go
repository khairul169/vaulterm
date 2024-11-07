package utils

import "github.com/gofiber/fiber/v2"

func ResponseError(c *fiber.Ctx, err error, status int) error {
	if status == 0 {
		status = fiber.StatusInternalServerError
	}

	return &fiber.Error{
		Code:    status,
		Message: err.Error(),
	}
}
