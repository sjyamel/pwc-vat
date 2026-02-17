
import { GoogleGenerativeAI } from "@google/generative-ai";


// console.log(process.env.GOOGLEAIKEY);
export const AIResponse = async (text: string) => {
	const apiKey: any = "AIzaSyBkbMngW7XDlbRVpo7JxHnc9IqU1YEOXNI";
	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

	const prompt = `${text}`;

	const result: any = await model.generateContent(prompt);
	return result?.response?.candidates[0].content?.parts[0]?.text;
};