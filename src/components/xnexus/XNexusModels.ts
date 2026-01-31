// XNexus AI - Complete Model Registry for BYTEZ API

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: string;
  subcategory: string;
  capabilities: string[];
  inputTypes: string[];
  outputTypes: string[];
}

export interface ModelCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subcategories: ModelSubcategory[];
}

export interface ModelSubcategory {
  id: string;
  name: string;
  icon: string;
  models: AIModel[];
}

// Popular Models
const popularModels: AIModel[] = [
  // Chat Models
  { id: 'meta-llama/Llama-3.2-3B-Instruct', name: 'Llama 3.2 3B Instruct', description: 'Fast conversational AI', provider: 'Meta', category: 'popular', subcategory: 'chat', capabilities: ['conversation', 'instruction-following'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'meta-llama/Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B Instruct', description: 'Balanced performance', provider: 'Meta', category: 'popular', subcategory: 'chat', capabilities: ['conversation', 'reasoning'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'meta-llama/Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B Instruct', description: 'High-quality responses', provider: 'Meta', category: 'popular', subcategory: 'chat', capabilities: ['conversation', 'complex-reasoning'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B Instruct', description: 'Efficient instruction model', provider: 'Mistral', category: 'popular', subcategory: 'chat', capabilities: ['conversation', 'coding'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'microsoft/Phi-3-mini-4k-instruct', name: 'Phi-3 Mini 4K', description: 'Compact but capable', provider: 'Microsoft', category: 'popular', subcategory: 'chat', capabilities: ['conversation', 'reasoning'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B', description: 'Multilingual chat', provider: 'Alibaba', category: 'popular', subcategory: 'chat', capabilities: ['conversation', 'multilingual'], inputTypes: ['text'], outputTypes: ['text'] },
  
  // Text-to-Image Models
  { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL Base 1.0', description: 'High-quality image generation', provider: 'Stability AI', category: 'popular', subcategory: 'text-to-image', capabilities: ['image-generation'], inputTypes: ['text'], outputTypes: ['image'] },
  { id: 'runwayml/stable-diffusion-v1-5', name: 'Stable Diffusion 1.5', description: 'Classic image generation', provider: 'Runway', category: 'popular', subcategory: 'text-to-image', capabilities: ['image-generation'], inputTypes: ['text'], outputTypes: ['image'] },
  { id: 'stabilityai/sdxl-turbo', name: 'SDXL Turbo', description: 'Fast image generation', provider: 'Stability AI', category: 'popular', subcategory: 'text-to-image', capabilities: ['fast-generation'], inputTypes: ['text'], outputTypes: ['image'] },
  
  // Feature Extraction
  { id: 'sentence-transformers/all-MiniLM-L6-v2', name: 'MiniLM L6 v2', description: 'Compact embeddings', provider: 'Sentence Transformers', category: 'popular', subcategory: 'feature-extraction', capabilities: ['embeddings'], inputTypes: ['text'], outputTypes: ['embeddings'] },
  { id: 'BAAI/bge-large-en-v1.5', name: 'BGE Large EN', description: 'High-quality embeddings', provider: 'BAAI', category: 'popular', subcategory: 'feature-extraction', capabilities: ['embeddings', 'retrieval'], inputTypes: ['text'], outputTypes: ['embeddings'] },
];

// Language Models
const languageModels: AIModel[] = [
  // Fill-Mask
  { id: 'bert-base-uncased', name: 'BERT Base', description: 'Classic masked language model', provider: 'Google', category: 'language', subcategory: 'fill-mask', capabilities: ['fill-mask', 'understanding'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'roberta-base', name: 'RoBERTa Base', description: 'Optimized BERT variant', provider: 'Meta', category: 'language', subcategory: 'fill-mask', capabilities: ['fill-mask'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'distilbert-base-uncased', name: 'DistilBERT', description: 'Lightweight BERT', provider: 'Hugging Face', category: 'language', subcategory: 'fill-mask', capabilities: ['fill-mask'], inputTypes: ['text'], outputTypes: ['text'] },
  
  // Question Answering
  { id: 'deepset/roberta-base-squad2', name: 'RoBERTa SQuAD2', description: 'Extractive QA model', provider: 'Deepset', category: 'language', subcategory: 'question-answering', capabilities: ['qa', 'extraction'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'distilbert-base-cased-distilled-squad', name: 'DistilBERT SQuAD', description: 'Fast QA model', provider: 'Hugging Face', category: 'language', subcategory: 'question-answering', capabilities: ['qa'], inputTypes: ['text'], outputTypes: ['text'] },
  
  // Sentence Similarity
  { id: 'sentence-transformers/all-mpnet-base-v2', name: 'MPNet Base v2', description: 'High-quality similarity', provider: 'Sentence Transformers', category: 'language', subcategory: 'sentence-similarity', capabilities: ['similarity', 'embeddings'], inputTypes: ['text'], outputTypes: ['embeddings'] },
  { id: 'sentence-transformers/paraphrase-MiniLM-L6-v2', name: 'Paraphrase MiniLM', description: 'Paraphrase detection', provider: 'Sentence Transformers', category: 'language', subcategory: 'sentence-similarity', capabilities: ['similarity'], inputTypes: ['text'], outputTypes: ['embeddings'] },
  
  // Summarization
  { id: 'facebook/bart-large-cnn', name: 'BART Large CNN', description: 'News summarization', provider: 'Meta', category: 'language', subcategory: 'summarization', capabilities: ['summarization'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'google/pegasus-xsum', name: 'Pegasus XSum', description: 'Extreme summarization', provider: 'Google', category: 'language', subcategory: 'summarization', capabilities: ['summarization'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'philschmid/bart-large-cnn-samsum', name: 'BART SamSum', description: 'Dialogue summarization', provider: 'Community', category: 'language', subcategory: 'summarization', capabilities: ['summarization', 'dialogue'], inputTypes: ['text'], outputTypes: ['text'] },
  
  // Text Classification
  { id: 'cardiffnlp/twitter-roberta-base-sentiment-latest', name: 'Twitter Sentiment', description: 'Social media sentiment', provider: 'Cardiff NLP', category: 'language', subcategory: 'text-classification', capabilities: ['sentiment', 'classification'], inputTypes: ['text'], outputTypes: ['labels'] },
  { id: 'facebook/bart-large-mnli', name: 'BART MNLI', description: 'Natural language inference', provider: 'Meta', category: 'language', subcategory: 'text-classification', capabilities: ['nli', 'classification'], inputTypes: ['text'], outputTypes: ['labels'] },
  
  // Text Generation
  { id: 'gpt2', name: 'GPT-2', description: 'Classic text generation', provider: 'OpenAI', category: 'language', subcategory: 'text-generation', capabilities: ['generation'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'EleutherAI/gpt-neo-2.7B', name: 'GPT-Neo 2.7B', description: 'Open GPT alternative', provider: 'EleutherAI', category: 'language', subcategory: 'text-generation', capabilities: ['generation'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'bigscience/bloom-560m', name: 'BLOOM 560M', description: 'Multilingual generation', provider: 'BigScience', category: 'language', subcategory: 'text-generation', capabilities: ['generation', 'multilingual'], inputTypes: ['text'], outputTypes: ['text'] },
  
  // Text2Text Generation
  { id: 'google/flan-t5-base', name: 'Flan-T5 Base', description: 'Instruction-tuned T5', provider: 'Google', category: 'language', subcategory: 'text2text-generation', capabilities: ['generation', 'instruction'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'google/flan-t5-large', name: 'Flan-T5 Large', description: 'Larger instruction model', provider: 'Google', category: 'language', subcategory: 'text2text-generation', capabilities: ['generation', 'instruction'], inputTypes: ['text'], outputTypes: ['text'] },
  
  // Token Classification
  { id: 'dslim/bert-base-NER', name: 'BERT NER', description: 'Named entity recognition', provider: 'Community', category: 'language', subcategory: 'token-classification', capabilities: ['ner'], inputTypes: ['text'], outputTypes: ['tokens'] },
  { id: 'Jean-Baptiste/camembert-ner', name: 'CamemBERT NER', description: 'French NER model', provider: 'Community', category: 'language', subcategory: 'token-classification', capabilities: ['ner', 'french'], inputTypes: ['text'], outputTypes: ['tokens'] },
  
  // Translation
  { id: 'Helsinki-NLP/opus-mt-en-de', name: 'OPUS EN-DE', description: 'English to German', provider: 'Helsinki NLP', category: 'language', subcategory: 'translation', capabilities: ['translation'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'Helsinki-NLP/opus-mt-en-fr', name: 'OPUS EN-FR', description: 'English to French', provider: 'Helsinki NLP', category: 'language', subcategory: 'translation', capabilities: ['translation'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'Helsinki-NLP/opus-mt-en-es', name: 'OPUS EN-ES', description: 'English to Spanish', provider: 'Helsinki NLP', category: 'language', subcategory: 'translation', capabilities: ['translation'], inputTypes: ['text'], outputTypes: ['text'] },
  { id: 'facebook/nllb-200-distilled-600M', name: 'NLLB 200', description: '200+ language translation', provider: 'Meta', category: 'language', subcategory: 'translation', capabilities: ['translation', 'multilingual'], inputTypes: ['text'], outputTypes: ['text'] },
  
  // Zero-Shot Classification
  { id: 'facebook/bart-large-mnli', name: 'BART MNLI', description: 'Zero-shot classifier', provider: 'Meta', category: 'language', subcategory: 'zero-shot-classification', capabilities: ['zero-shot', 'classification'], inputTypes: ['text'], outputTypes: ['labels'] },
  { id: 'MoritzLawornia/roberta-large-mnli', name: 'RoBERTa MNLI', description: 'Robust zero-shot', provider: 'Community', category: 'language', subcategory: 'zero-shot-classification', capabilities: ['zero-shot', 'classification'], inputTypes: ['text'], outputTypes: ['labels'] },
];

// Vision Models
const visionModels: AIModel[] = [
  // Depth Estimation
  { id: 'Intel/dpt-large', name: 'DPT Large', description: 'Dense depth prediction', provider: 'Intel', category: 'vision', subcategory: 'depth-estimation', capabilities: ['depth'], inputTypes: ['image'], outputTypes: ['depth-map'] },
  { id: 'Intel/dpt-hybrid-midas', name: 'DPT Hybrid MiDaS', description: 'Hybrid depth model', provider: 'Intel', category: 'vision', subcategory: 'depth-estimation', capabilities: ['depth'], inputTypes: ['image'], outputTypes: ['depth-map'] },
  
  // Image Classification
  { id: 'google/vit-base-patch16-224', name: 'ViT Base', description: 'Vision Transformer', provider: 'Google', category: 'vision', subcategory: 'image-classification', capabilities: ['classification'], inputTypes: ['image'], outputTypes: ['labels'] },
  { id: 'microsoft/resnet-50', name: 'ResNet-50', description: 'Classic CNN classifier', provider: 'Microsoft', category: 'vision', subcategory: 'image-classification', capabilities: ['classification'], inputTypes: ['image'], outputTypes: ['labels'] },
  { id: 'facebook/convnext-base-224', name: 'ConvNeXt Base', description: 'Modern CNN', provider: 'Meta', category: 'vision', subcategory: 'image-classification', capabilities: ['classification'], inputTypes: ['image'], outputTypes: ['labels'] },
  
  // Image Feature Extraction
  { id: 'openai/clip-vit-base-patch32', name: 'CLIP ViT Base', description: 'Vision-language embeddings', provider: 'OpenAI', category: 'vision', subcategory: 'image-feature-extraction', capabilities: ['embeddings', 'multimodal'], inputTypes: ['image'], outputTypes: ['embeddings'] },
  { id: 'facebook/dinov2-base', name: 'DINOv2 Base', description: 'Self-supervised features', provider: 'Meta', category: 'vision', subcategory: 'image-feature-extraction', capabilities: ['embeddings'], inputTypes: ['image'], outputTypes: ['embeddings'] },
  
  // Image Segmentation
  { id: 'facebook/sam-vit-base', name: 'SAM ViT Base', description: 'Segment Anything', provider: 'Meta', category: 'vision', subcategory: 'image-segmentation', capabilities: ['segmentation'], inputTypes: ['image'], outputTypes: ['mask'] },
  { id: 'nvidia/segformer-b0-finetuned-ade-512-512', name: 'SegFormer B0', description: 'Semantic segmentation', provider: 'NVIDIA', category: 'vision', subcategory: 'image-segmentation', capabilities: ['segmentation'], inputTypes: ['image'], outputTypes: ['mask'] },
  
  // Image to Text
  { id: 'Salesforce/blip-image-captioning-base', name: 'BLIP Captioning', description: 'Image captioning', provider: 'Salesforce', category: 'vision', subcategory: 'image-to-text', capabilities: ['captioning'], inputTypes: ['image'], outputTypes: ['text'] },
  { id: 'nlpconnect/vit-gpt2-image-captioning', name: 'ViT-GPT2 Caption', description: 'Vision to text', provider: 'Community', category: 'vision', subcategory: 'image-to-text', capabilities: ['captioning'], inputTypes: ['image'], outputTypes: ['text'] },
  
  // Mask Generation
  { id: 'facebook/sam-vit-huge', name: 'SAM ViT Huge', description: 'High-quality masks', provider: 'Meta', category: 'vision', subcategory: 'mask-generation', capabilities: ['mask-generation'], inputTypes: ['image'], outputTypes: ['mask'] },
  
  // Object Detection
  { id: 'facebook/detr-resnet-50', name: 'DETR ResNet-50', description: 'End-to-end detection', provider: 'Meta', category: 'vision', subcategory: 'object-detection', capabilities: ['detection'], inputTypes: ['image'], outputTypes: ['boxes'] },
  { id: 'hustvl/yolos-tiny', name: 'YOLOS Tiny', description: 'Fast object detection', provider: 'Community', category: 'vision', subcategory: 'object-detection', capabilities: ['detection'], inputTypes: ['image'], outputTypes: ['boxes'] },
  
  // Text to Video
  { id: 'damo-vilab/text-to-video-ms-1.7b', name: 'Text-to-Video MS', description: 'Video generation', provider: 'DAMO', category: 'vision', subcategory: 'text-to-video', capabilities: ['video-generation'], inputTypes: ['text'], outputTypes: ['video'] },
  
  // Unconditional Image Generation
  { id: 'google/ddpm-celebahq-256', name: 'DDPM CelebA', description: 'Face generation', provider: 'Google', category: 'vision', subcategory: 'unconditional-image-generation', capabilities: ['generation'], inputTypes: [], outputTypes: ['image'] },
  
  // Video Classification
  { id: 'MCG-NJU/videomae-base', name: 'VideoMAE Base', description: 'Video understanding', provider: 'MCG-NJU', category: 'vision', subcategory: 'video-classification', capabilities: ['classification'], inputTypes: ['video'], outputTypes: ['labels'] },
  
  // Zero-Shot Image Classification
  { id: 'openai/clip-vit-large-patch14', name: 'CLIP ViT Large', description: 'Zero-shot vision', provider: 'OpenAI', category: 'vision', subcategory: 'zero-shot-image-classification', capabilities: ['zero-shot', 'classification'], inputTypes: ['image', 'text'], outputTypes: ['labels'] },
  
  // Zero-Shot Object Detection
  { id: 'google/owlvit-base-patch32', name: 'OWL-ViT Base', description: 'Open-vocabulary detection', provider: 'Google', category: 'vision', subcategory: 'zero-shot-object-detection', capabilities: ['detection', 'zero-shot'], inputTypes: ['image', 'text'], outputTypes: ['boxes'] },
];

// Audio Models
const audioModels: AIModel[] = [
  // Audio Classification
  { id: 'MIT/ast-finetuned-audioset-10-10-0.4593', name: 'AST AudioSet', description: 'Audio event detection', provider: 'MIT', category: 'audio', subcategory: 'audio-classification', capabilities: ['classification'], inputTypes: ['audio'], outputTypes: ['labels'] },
  { id: 'superb/wav2vec2-base-superb-ks', name: 'Wav2Vec2 KS', description: 'Keyword spotting', provider: 'Superb', category: 'audio', subcategory: 'audio-classification', capabilities: ['classification'], inputTypes: ['audio'], outputTypes: ['labels'] },
  
  // Automatic Speech Recognition
  { id: 'openai/whisper-base', name: 'Whisper Base', description: 'Multilingual ASR', provider: 'OpenAI', category: 'audio', subcategory: 'automatic-speech-recognition', capabilities: ['transcription'], inputTypes: ['audio'], outputTypes: ['text'] },
  { id: 'openai/whisper-large-v3', name: 'Whisper Large v3', description: 'Best accuracy ASR', provider: 'OpenAI', category: 'audio', subcategory: 'automatic-speech-recognition', capabilities: ['transcription'], inputTypes: ['audio'], outputTypes: ['text'] },
  { id: 'facebook/wav2vec2-base-960h', name: 'Wav2Vec2 960h', description: 'English ASR', provider: 'Meta', category: 'audio', subcategory: 'automatic-speech-recognition', capabilities: ['transcription'], inputTypes: ['audio'], outputTypes: ['text'] },
  
  // Text to Audio
  { id: 'facebook/musicgen-small', name: 'MusicGen Small', description: 'Music generation', provider: 'Meta', category: 'audio', subcategory: 'text-to-audio', capabilities: ['music-generation'], inputTypes: ['text'], outputTypes: ['audio'] },
  { id: 'facebook/musicgen-medium', name: 'MusicGen Medium', description: 'Better music quality', provider: 'Meta', category: 'audio', subcategory: 'text-to-audio', capabilities: ['music-generation'], inputTypes: ['text'], outputTypes: ['audio'] },
  
  // Text to Speech
  { id: 'microsoft/speecht5_tts', name: 'SpeechT5 TTS', description: 'Natural speech synthesis', provider: 'Microsoft', category: 'audio', subcategory: 'text-to-speech', capabilities: ['tts'], inputTypes: ['text'], outputTypes: ['audio'] },
  { id: 'facebook/mms-tts-eng', name: 'MMS TTS English', description: 'English TTS', provider: 'Meta', category: 'audio', subcategory: 'text-to-speech', capabilities: ['tts'], inputTypes: ['text'], outputTypes: ['audio'] },
];

// Multimodal Models
const multimodalModels: AIModel[] = [
  // Audio Text to Text
  { id: 'openai/whisper-large-v3', name: 'Whisper Large v3', description: 'Speech understanding', provider: 'OpenAI', category: 'multimodal', subcategory: 'audio-text-to-text', capabilities: ['transcription', 'translation'], inputTypes: ['audio'], outputTypes: ['text'] },
  
  // Document Question Answering
  { id: 'impira/layoutlm-document-qa', name: 'LayoutLM DocQA', description: 'Document understanding', provider: 'Impira', category: 'multimodal', subcategory: 'document-question-answering', capabilities: ['document-qa'], inputTypes: ['image', 'text'], outputTypes: ['text'] },
  { id: 'microsoft/layoutlmv3-base', name: 'LayoutLMv3 Base', description: 'Advanced document AI', provider: 'Microsoft', category: 'multimodal', subcategory: 'document-question-answering', capabilities: ['document-qa'], inputTypes: ['image', 'text'], outputTypes: ['text'] },
  
  // Image Text to Text
  { id: 'Salesforce/blip2-opt-2.7b', name: 'BLIP-2 OPT 2.7B', description: 'Vision-language model', provider: 'Salesforce', category: 'multimodal', subcategory: 'image-text-to-text', capabilities: ['vqa', 'captioning'], inputTypes: ['image', 'text'], outputTypes: ['text'] },
  { id: 'llava-hf/llava-1.5-7b-hf', name: 'LLaVA 1.5 7B', description: 'Visual assistant', provider: 'LLaVA', category: 'multimodal', subcategory: 'image-text-to-text', capabilities: ['vqa', 'conversation'], inputTypes: ['image', 'text'], outputTypes: ['text'] },
  
  // Video Text to Text
  { id: 'microsoft/xclip-base-patch32', name: 'X-CLIP Base', description: 'Video understanding', provider: 'Microsoft', category: 'multimodal', subcategory: 'video-text-to-text', capabilities: ['video-qa'], inputTypes: ['video', 'text'], outputTypes: ['text'] },
  
  // Visual Question Answering
  { id: 'dandelin/vilt-b32-finetuned-vqa', name: 'ViLT VQA', description: 'Visual QA model', provider: 'Community', category: 'multimodal', subcategory: 'visual-question-answering', capabilities: ['vqa'], inputTypes: ['image', 'text'], outputTypes: ['text'] },
  { id: 'Salesforce/blip-vqa-base', name: 'BLIP VQA Base', description: 'BLIP visual QA', provider: 'Salesforce', category: 'multimodal', subcategory: 'visual-question-answering', capabilities: ['vqa'], inputTypes: ['image', 'text'], outputTypes: ['text'] },
];

// Category Definitions
export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    id: 'popular',
    name: 'Popular',
    icon: 'Star',
    color: 'from-yellow-500 to-orange-500',
    description: 'Most used AI models',
    subcategories: [
      { id: 'chat', name: 'Chat', icon: 'MessageSquare', models: popularModels.filter(m => m.subcategory === 'chat') },
      { id: 'text-to-image', name: 'Text to Image', icon: 'Image', models: popularModels.filter(m => m.subcategory === 'text-to-image') },
      { id: 'feature-extraction', name: 'Feature Extraction', icon: 'Sparkles', models: popularModels.filter(m => m.subcategory === 'feature-extraction') },
    ]
  },
  {
    id: 'language',
    name: 'Language',
    icon: 'Type',
    color: 'from-purple-500 to-pink-500',
    description: 'Natural language processing',
    subcategories: [
      { id: 'fill-mask', name: 'Fill Mask', icon: 'TextCursor', models: languageModels.filter(m => m.subcategory === 'fill-mask') },
      { id: 'question-answering', name: 'Question Answering', icon: 'HelpCircle', models: languageModels.filter(m => m.subcategory === 'question-answering') },
      { id: 'sentence-similarity', name: 'Sentence Similarity', icon: 'GitCompare', models: languageModels.filter(m => m.subcategory === 'sentence-similarity') },
      { id: 'summarization', name: 'Summarization', icon: 'FileText', models: languageModels.filter(m => m.subcategory === 'summarization') },
      { id: 'text-classification', name: 'Text Classification', icon: 'Tags', models: languageModels.filter(m => m.subcategory === 'text-classification') },
      { id: 'text-generation', name: 'Text Generation', icon: 'PenTool', models: languageModels.filter(m => m.subcategory === 'text-generation') },
      { id: 'text2text-generation', name: 'Text2Text Generation', icon: 'RefreshCw', models: languageModels.filter(m => m.subcategory === 'text2text-generation') },
      { id: 'token-classification', name: 'Token Classification', icon: 'Hash', models: languageModels.filter(m => m.subcategory === 'token-classification') },
      { id: 'translation', name: 'Translation', icon: 'Languages', models: languageModels.filter(m => m.subcategory === 'translation') },
      { id: 'zero-shot-classification', name: 'Zero-Shot Classification', icon: 'Zap', models: languageModels.filter(m => m.subcategory === 'zero-shot-classification') },
    ]
  },
  {
    id: 'vision',
    name: 'Vision',
    icon: 'Eye',
    color: 'from-blue-500 to-cyan-500',
    description: 'Computer vision tasks',
    subcategories: [
      { id: 'depth-estimation', name: 'Depth Estimation', icon: 'Layers', models: visionModels.filter(m => m.subcategory === 'depth-estimation') },
      { id: 'image-classification', name: 'Image Classification', icon: 'ImageIcon', models: visionModels.filter(m => m.subcategory === 'image-classification') },
      { id: 'image-feature-extraction', name: 'Image Feature Extraction', icon: 'Sparkles', models: visionModels.filter(m => m.subcategory === 'image-feature-extraction') },
      { id: 'image-segmentation', name: 'Image Segmentation', icon: 'Grid3X3', models: visionModels.filter(m => m.subcategory === 'image-segmentation') },
      { id: 'image-to-text', name: 'Image to Text', icon: 'ScanText', models: visionModels.filter(m => m.subcategory === 'image-to-text') },
      { id: 'mask-generation', name: 'Mask Generation', icon: 'Slice', models: visionModels.filter(m => m.subcategory === 'mask-generation') },
      { id: 'object-detection', name: 'Object Detection', icon: 'Search', models: visionModels.filter(m => m.subcategory === 'object-detection') },
      { id: 'text-to-video', name: 'Text to Video', icon: 'Video', models: visionModels.filter(m => m.subcategory === 'text-to-video') },
      { id: 'unconditional-image-generation', name: 'Unconditional Image Gen', icon: 'Shuffle', models: visionModels.filter(m => m.subcategory === 'unconditional-image-generation') },
      { id: 'video-classification', name: 'Video Classification', icon: 'Film', models: visionModels.filter(m => m.subcategory === 'video-classification') },
      { id: 'zero-shot-image-classification', name: 'Zero-Shot Image Class', icon: 'Zap', models: visionModels.filter(m => m.subcategory === 'zero-shot-image-classification') },
      { id: 'zero-shot-object-detection', name: 'Zero-Shot Object Detection', icon: 'Target', models: visionModels.filter(m => m.subcategory === 'zero-shot-object-detection') },
    ]
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: 'Music',
    color: 'from-green-500 to-emerald-500',
    description: 'Audio processing',
    subcategories: [
      { id: 'audio-classification', name: 'Audio Classification', icon: 'Headphones', models: audioModels.filter(m => m.subcategory === 'audio-classification') },
      { id: 'automatic-speech-recognition', name: 'Speech Recognition', icon: 'Mic', models: audioModels.filter(m => m.subcategory === 'automatic-speech-recognition') },
      { id: 'text-to-audio', name: 'Text to Audio', icon: 'Volume2', models: audioModels.filter(m => m.subcategory === 'text-to-audio') },
      { id: 'text-to-speech', name: 'Text to Speech', icon: 'Speech', models: audioModels.filter(m => m.subcategory === 'text-to-speech') },
    ]
  },
  {
    id: 'multimodal',
    name: 'Multimodal',
    icon: 'Combine',
    color: 'from-indigo-500 to-violet-500',
    description: 'Multi-input AI models',
    subcategories: [
      { id: 'audio-text-to-text', name: 'Audio Text to Text', icon: 'FileAudio', models: multimodalModels.filter(m => m.subcategory === 'audio-text-to-text') },
      { id: 'document-question-answering', name: 'Document QA', icon: 'FileQuestion', models: multimodalModels.filter(m => m.subcategory === 'document-question-answering') },
      { id: 'image-text-to-text', name: 'Image Text to Text', icon: 'ImagePlus', models: multimodalModels.filter(m => m.subcategory === 'image-text-to-text') },
      { id: 'video-text-to-text', name: 'Video Text to Text', icon: 'VideoIcon', models: multimodalModels.filter(m => m.subcategory === 'video-text-to-text') },
      { id: 'visual-question-answering', name: 'Visual QA', icon: 'MessageCircleQuestion', models: multimodalModels.filter(m => m.subcategory === 'visual-question-answering') },
    ]
  },
];

// Get all models flat
export const getAllModels = (): AIModel[] => {
  return [...popularModels, ...languageModels, ...visionModels, ...audioModels, ...multimodalModels];
};

// Get models by category
export const getModelsByCategory = (categoryId: string): AIModel[] => {
  const category = MODEL_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return [];
  return category.subcategories.flatMap(sub => sub.models);
};

// Get model by ID
export const getModelById = (modelId: string): AIModel | undefined => {
  return getAllModels().find(m => m.id === modelId);
};
