(function(){
  'use strict';

  const AI_LOG_PREFIX='[DevRoadmap AI]';
  const REQUEST_TIMEOUT_MS=45000;

  function logInfo(message, extra){
    if(typeof extra==='undefined') console.info(AI_LOG_PREFIX, message);
    else console.info(AI_LOG_PREFIX, message, extra);
  }

  function logError(message, extra){
    if(typeof extra==='undefined') console.error(AI_LOG_PREFIX, message);
    else console.error(AI_LOG_PREFIX, message, extra);
  }

  async function fetchJsonWithTimeout(url, options, meta){
    const controller=new AbortController();
    const timeoutId=setTimeout(()=>controller.abort(new Error('Request timed out')), REQUEST_TIMEOUT_MS);
    try{
      logInfo('Starting provider request', meta);
      const response=await fetch(url, { ...options, signal: controller.signal });
      const data=await response.json();
      if(!response.ok){
        logError('Provider request returned non-OK response', { meta: meta, status: response.status, data: data });
      }
      return { response: response, data: data };
    }catch(error){
      logError('Provider request failed', { meta: meta, error: error });
      throw error;
    }finally{
      clearTimeout(timeoutId);
    }
  }

  const PROVIDERS = {
    prompt: {
      id: 'prompt',
      name: 'Prompt Mode',
      short: 'Free fallback',
      hint: 'Creates a detailed prompt you can paste into ChatGPT, Claude, Gemini, or another free web chat.',
      keyLabel: 'No API key required',
      keyPlaceholder: '',
      model: 'prompt-only',
      free: true
    },
    anthropic: {
      id: 'anthropic',
      name: 'Anthropic',
      short: 'Claude API',
      hint: 'Good for long-form roadmap generation. Requires your Anthropic API key.',
      keyLabel: 'Anthropic API key',
      keyPlaceholder: 'sk-ant-...',
      model: 'claude-sonnet-4-20250514'
    },
    openai: {
      id: 'openai',
      name: 'OpenAI',
      short: 'GPT models',
      hint: 'Use your OpenAI API key to generate detailed roadmaps with structured JSON output.',
      keyLabel: 'OpenAI API key',
      keyPlaceholder: 'sk-...',
      model: 'gpt-4o-mini'
    },
    gemini: {
      id: 'gemini',
      name: 'Google Gemini',
      short: 'Free tier available',
      hint: 'Works with Gemini API keys. Google AI Studio has a free tier in eligible regions.',
      keyLabel: 'Gemini API key',
      keyPlaceholder: 'AIza...',
      model: 'gemini-2.5-flash',
      free: true
    },
    openrouter: {
      id: 'openrouter',
      name: 'OpenRouter',
      short: 'Free models available',
      hint: 'Useful when you want access to several providers from one API and to experiment with free models.',
      keyLabel: 'OpenRouter API key',
      keyPlaceholder: 'sk-or-...',
      model: 'openai/gpt-4.1-mini',
      free: true
    }
  };

  function getDefaultState(){
    return {
      activeProvider: 'prompt',
      providers: {
        prompt: { apiKey: '', model: PROVIDERS.prompt.model },
        anthropic: { apiKey: '', model: PROVIDERS.anthropic.model },
        openai: { apiKey: '', model: PROVIDERS.openai.model },
        gemini: { apiKey: '', model: PROVIDERS.gemini.model },
        openrouter: { apiKey: '', model: PROVIDERS.openrouter.model }
      }
    };
  }

  function normalizeState(state){
    const defaults = getDefaultState();
    state.ai = state.ai || defaults;
    state.ai.activeProvider = state.ai.activeProvider || defaults.activeProvider;
    state.ai.providers = state.ai.providers || {};

    Object.keys(defaults.providers).forEach(function(id){
      state.ai.providers[id] = Object.assign({}, defaults.providers[id], state.ai.providers[id] || {});
    });

    if(state.apiKey && !state.ai.providers.anthropic.apiKey){
      state.ai.providers.anthropic.apiKey = state.apiKey;
      state.ai.activeProvider = 'anthropic';
    }

    state.apiKey = state.ai.providers.anthropic.apiKey || '';
    return state;
  }

  function getActiveProvider(state){
    normalizeState(state);
    return PROVIDERS[state.ai.activeProvider] || PROVIDERS.prompt;
  }

  function getActiveConfig(state){
    const provider = getActiveProvider(state);
    return state.ai.providers[provider.id];
  }

  function providerOptions(selected){
    return Object.keys(PROVIDERS).map(function(id){
      const provider = PROVIDERS[id];
      return '<option value="' + id + '"' + (selected === id ? ' selected' : '') + '>' + provider.name + '</option>';
    }).join('');
  }

  function providerCards(selected){
    return Object.keys(PROVIDERS).map(function(id){
      const provider = PROVIDERS[id];
      return '<button class="provider-card' + (selected === id ? ' active' : '') + '" type="button" data-action="switch-ai-provider" data-provider-id="' + id + '">' +
        '<span class="provider-card-name">' + provider.name + '</span>' +
        '<span class="provider-card-meta">' + provider.short + '</span>' +
      '</button>';
    }).join('');
  }

  function renderSetupScreen(container, state){
    normalizeState(state);
    const provider = getActiveProvider(state);
    const config = getActiveConfig(state);
    const hideKey = provider.id === 'prompt';

    container.innerHTML =
      '<div style="font-size:2rem;margin-bottom:12px">AI</div>' +
      '<div class="api-setup-title">Connect an AI Provider</div>' +
      '<div class="api-setup-sub">You can use Anthropic, OpenAI, Gemini, OpenRouter, or stay in Prompt Mode and paste the generated prompt into a free chat tool.</div>' +
      '<div class="provider-card-grid">' + providerCards(provider.id) + '</div>' +
      '<div class="provider-form">' +
        '<label class="provider-label" for="providerSelect">Provider</label>' +
          '<select id="providerSelect" class="provider-select" data-action="switch-ai-provider-select">' + providerOptions(provider.id) + '</select>' +
        '<label class="provider-label" for="providerModelInput">Model</label>' +
        '<input id="providerModelInput" class="ak-input" value="' + (config.model || '') + '" placeholder="Model name" data-action="update-active-model">' +
        '<div class="provider-hint">' + provider.hint + '</div>' +
        '<div class="provider-key-wrap' + (hideKey ? ' is-hidden' : '') + '">' +
          '<label class="provider-label" for="providerKeyInput">' + provider.keyLabel + '</label>' +
          '<div class="ak-input-wrap">' +
        '<input id="providerKeyInput" type="password" placeholder="' + provider.keyPlaceholder + '" class="ak-input" value="' + (config.apiKey || '') + '" data-action="update-active-key">' +
        '<span class="ak-vis-btn" role="button" tabindex="0" data-action="toggle-ak-vis">Show</span>' +
          '</div>' +
        '</div>' +
        '<div class="provider-free-note">' + (provider.free ? 'Free option available. Limits vary by provider and account.' : 'Paid API usage may apply depending on your account.') + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:18px">' +
      '<button class="btn-primary" type="button" data-action="save-api-key">Save & Continue</button>' +
      '<button class="btn-secondary" type="button" data-action="skip-api-key">Skip for now</button>' +
      '</div>';
  }

  function renderGeneratorPanel(container, state){
    normalizeState(state);
    const provider = getActiveProvider(state);
    const config = getActiveConfig(state);

    container.innerHTML =
      '<div class="gen-provider-panel">' +
        '<div class="provider-inline-row">' +
          '<div class="provider-inline-group">' +
            '<label class="provider-label" for="genProviderSelect">Provider</label>' +
        '<select id="genProviderSelect" class="provider-select" data-action="switch-ai-provider-generator">' + providerOptions(provider.id) + '</select>' +
          '</div>' +
          '<div class="provider-inline-group">' +
            '<label class="provider-label" for="genModelInput">Model</label>' +
      '<input id="genModelInput" class="topic-input provider-model-input" value="' + (config.model || '') + '" data-action="update-active-model-generator">' +
          '</div>' +
      '<button class="btn-secondary provider-config-btn" type="button" data-action="open-api-setup">Configure</button>' +
        '</div>' +
        '<div class="provider-hint">' + provider.hint + '</div>' +
      '</div>';
  }

  function buildRoadmapPrompt(topic){
    return [
      'You are an expert senior engineer, educator, and interview coach.',
      'Generate a very detailed learning roadmap for the topic: ' + topic + '.',
      'Return ONLY valid JSON.',
      'Do not wrap the JSON in markdown fences.',
      'The roadmap must help a learner go from beginner to professional / interview-ready level.',
      'Use this exact JSON shape:',
      '{',
      '  "title": "Topic name",',
      '  "summary": "2-3 sentence overview",',
      '  "phases": [',
      '    {',
      '      "title": "Phase title",',
      '      "duration": "X weeks",',
      '      "goal": "What the learner should be able to do by the end",',
      '      "topics": [',
      '        {',
      '          "name": "Topic name",',
      '          "why_it_matters": "Short explanation",',
      '          "focus_points": ["point 1", "point 2", "point 3"],',
      '          "links": [',
      '            {"type":"doc","label":"Docs: title","url":"https://..."},',
      '            {"type":"yt","label":"YT: title","url":"https://..."},',
      '            {"type":"lc","label":"Practice: title","url":"https://..."},',
      '            {"type":"cert","label":"Course: title","url":"https://..."}',
      '          ]',
      '        }',
      '      ],',
      '      "projects": [',
      '        {"title":"Project title","description":"Detailed project brief","tags":["Tag1","Tag2"]}',
      '      ],',
      '      "certificates": [',
      '        {"name":"Certificate or study track","provider":"Platform - Free/Paid","url":"https://..."}',
      '      ]',
      '    }',
      '  ],',
      '  "career_notes": ["note 1", "note 2"],',
      '  "free_options": ["free option 1", "free option 2"]',
      '}',
      'Rules:',
      '- 6 to 8 phases.',
      '- 4 to 6 topics per phase.',
      '- Every topic should include why_it_matters and 3 practical focus_points.',
      '- Use real working URLs only.',
      '- Prefer free or free-to-audit resources whenever possible.',
      '- Include projects that become portfolio pieces, not toy tasks.',
      '- Include practice problems if the topic is interview-heavy.',
      '- Include at least one free option section when relevant.',
      '- Keep the roadmap balanced: fundamentals, building, debugging, deployment, and interview/career prep.'
    ].join('\n');
  }

  function buildPromptOnlyResult(topic){
    const prompt = buildRoadmapPrompt(topic);
    const freeOptions = [
      { name: 'ChatGPT', url: 'https://chatgpt.com/' },
      { name: 'Claude', url: 'https://claude.ai/' },
      { name: 'Gemini', url: 'https://gemini.google.com/' },
      { name: 'OpenRouter', url: 'https://openrouter.ai/' },
      { name: 'Hugging Face Chat', url: 'https://huggingface.co/chat/' }
    ];
    return { mode: 'prompt', prompt: prompt, freeOptions: freeOptions };
  }

  function extractJson(text){
    const cleaned = String(text || '').replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    return start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;
  }

  async function requestAnthropic(config, prompt){
    const result = await fetchJsonWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || PROVIDERS.anthropic.model,
        max_tokens: 5000,
        system: prompt,
        messages: [{ role: 'user', content: 'Generate the roadmap now.' }]
      })
    }, { provider: 'Anthropic', model: config.model || PROVIDERS.anthropic.model });
    const response = result.response;
    const data = result.data;
    if(!response.ok || data.error) throw new Error((data.error && data.error.message) || 'Anthropic request failed');
    const text = (data.content || []).filter(function(item){ return item.type === 'text'; }).map(function(item){ return item.text; }).join('');
    return { jsonText: extractJson(text), usage: data.usage || {} };
  }

  async function requestOpenAI(config, prompt){
    const result = await fetchJsonWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.apiKey
      },
      body: JSON.stringify({
        model: config.model || PROVIDERS.openai.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Generate the roadmap now.' }
        ],
        temperature: 0.3,
        max_completion_tokens: 5000
      })
    }, { provider: 'OpenAI', model: config.model || PROVIDERS.openai.model });
    const response = result.response;
    const data = result.data;
    if(!response.ok || data.error) throw new Error((data.error && data.error.message) || 'OpenAI request failed');
    const text = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
    return { jsonText: extractJson(text), usage: data.usage || {} };
  }

  async function requestGemini(config, prompt){
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(config.model || PROVIDERS.gemini.model) + ':generateContent?key=' + encodeURIComponent(config.apiKey);
    const result = await fetchJsonWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompt }] },
        contents: [{ role: 'user', parts: [{ text: 'Generate the roadmap now.' }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      })
    }, { provider: 'Gemini', model: config.model || PROVIDERS.gemini.model });
    const response = result.response;
    const data = result.data;
    if(!response.ok || data.error) throw new Error((data.error && data.error.message) || 'Gemini request failed');
    const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
    const text = parts.map(function(item){ return item.text || ''; }).join('');
    return { jsonText: extractJson(text), usage: data.usageMetadata || {} };
  }

  async function requestOpenRouter(config, prompt){
    const result = await fetchJsonWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.apiKey,
        'HTTP-Referer': window.location.href,
        'X-Title': 'DevRoadmap Pro'
      },
      body: JSON.stringify({
        model: config.model || PROVIDERS.openrouter.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Generate the roadmap now.' }
        ],
        temperature: 0.3
      })
    }, { provider: 'OpenRouter', model: config.model || PROVIDERS.openrouter.model });
    const response = result.response;
    const data = result.data;
    if(!response.ok || data.error) throw new Error((data.error && data.error.message) || 'OpenRouter request failed');
    const text = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
    return { jsonText: extractJson(text), usage: data.usage || {} };
  }

  async function requestRoadmap(topic, state){
    normalizeState(state);
    const provider = getActiveProvider(state);
    const config = getActiveConfig(state);
    const prompt = buildRoadmapPrompt(topic);

    if(provider.id === 'prompt'){
      logInfo('Using prompt-only roadmap mode', { topic: topic });
      return buildPromptOnlyResult(topic);
    }

    if(!config.apiKey){
      throw new Error('Add your ' + provider.name + ' API key first or switch to Prompt Mode.');
    }

    let result;
    if(provider.id === 'anthropic') result = await requestAnthropic(config, prompt);
    if(provider.id === 'openai') result = await requestOpenAI(config, prompt);
    if(provider.id === 'gemini') result = await requestGemini(config, prompt);
    if(provider.id === 'openrouter') result = await requestOpenRouter(config, prompt);

    const parsed = JSON.parse(result.jsonText);
    logInfo('Provider roadmap generation succeeded', { provider: provider.name, topic: topic });
    return { mode: 'json', data: parsed, usage: result.usage || {} };
  }

  function renderPromptOnlyResult(result, topic){
    return '' +
      '<div class="prompt-mode-card">' +
        '<div class="prompt-mode-title">Free prompt ready for ' + topic + '</div>' +
        '<div class="prompt-mode-sub">Paste this into ChatGPT, Claude, Gemini, OpenRouter, or another chat tool if you do not want to use an API key right now.</div>' +
        '<textarea class="prompt-output" readonly>' + result.prompt + '</textarea>' +
        '<div class="link-row">' +
          result.freeOptions.map(function(item){
            return '<a class="link-pill doc" href="' + item.url + '" target="_blank" rel="noopener noreferrer">' + item.name + '</a>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  window.AIProviderKit = {
    providers: PROVIDERS,
    normalizeState: normalizeState,
    getDefaultState: getDefaultState,
    getActiveProvider: getActiveProvider,
    getActiveConfig: getActiveConfig,
    renderSetupScreen: renderSetupScreen,
    renderGeneratorPanel: renderGeneratorPanel,
    buildRoadmapPrompt: buildRoadmapPrompt,
    requestRoadmap: requestRoadmap,
    renderPromptOnlyResult: renderPromptOnlyResult
  };
})();
