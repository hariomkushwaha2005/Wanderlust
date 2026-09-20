import Joi from "joi";

// Joi schemas centralize request validation so malformed payloads fail early and consistently.
// Validate listing request bodies before creating or updating documents.
export const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        categories: Joi.array().items(
            Joi.string().valid(
                "Trending",
                "Rooms",
                "Iconic Cities",
                "Mountains",
                "Castles",
                "Amazing Pools",
                "Camping",
                "Farms",
                "Arctic",
                "Domes",
                "Boats"
            )
        ).single().optional(),
        image: Joi.alternatives().try(
            Joi.object({
                url: Joi.string().allow("", null),
                filename: Joi.string().allow("", null),
            }).unknown(true),
            Joi.string().allow("", null)
        ).optional()
    }).required()
});

// Validate review request bodies before saving them.
export const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
})