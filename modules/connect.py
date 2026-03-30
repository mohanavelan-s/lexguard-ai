def get_lawyers(city, specialization):
    """
    INPUT:
        city (str)
        specialization (str)

    OUTPUT:
        {
            "success": True,
            "lawyers": [
                {
                    "name": str,
                    "city": str,
                    "specialization": str,
                    "contact": str
                }
            ]
        }
    """

    return {
        "success": True,
        "lawyers": [
            {
                "name": "Adv. Raj Kumar",
                "city": city,
                "specialization": specialization,
                "contact": "raj@email.com"
            }
        ]
    }
