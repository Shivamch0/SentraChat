import Openai from "openai";
    
const openai = new Openai({
    apiKey : process.env.OPENAI_API_KEY
});

export const analyzeEmotion = async (text) => {
    try {
        const response = await openai.chat.completions.create({
            model : "gpt-4o-mini",
            messages :[ {
                role : "system",
                content : "Classify the emotion of this message as positive, negative, or neutral. Reply with only one word."
            },
            {
                role : "user",
                content : text
            }
        ],
        temperature : 0
        });
        return response.choices[0].message.content.trim().toLocaleLowerCase()
    } catch (error) {
        console.log("Emotion api failed : " , error.message);
        return " neutral "
    }
}