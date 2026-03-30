def protect_me(keyword):
    """
    INPUT:
        keyword (str)

    OUTPUT:
        {
            "success": True,
            "status": str,
            "message": str,
            "action": str
        }
    """

    return {
        "success": True,
        "status": "Activated",
        "message": f"Keyword '{keyword}' detected.",
        "action": "Emergency mode enabled. Audio recording started."
    }
