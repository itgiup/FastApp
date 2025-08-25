from beanie import Document


class Settings(Document):
    name: str

    @classmethod
    async def find_by_name(cls, *, name: str):
        return await cls.find_one({"name": name})



    class Settings:
        name = "settings"
        indexes = [
            [("name", 1)]
        ]
        use_state_management = True

    class Config:
        extra = 'allow'
