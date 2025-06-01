export const SUMMARY_TEMPLATE_WITH_ASSET_NAME = (assetName: string) => {
  return `帮忙介绍下下面资产的最新资讯以及投资建议，资产名称：${assetName}。
    最后帮忙提问3个关于本资产的问题，回答格式如下（请严格按照以下格式回答，其中[Questions]和[tab]是固定格式，用来标识和分隔问题，请务必保留）：
    [Questions]
    1. 问题1[tab]
    2. 问题2[tab]
    3. 问题3[tab]`;
}

export const STRATEGY_PIE_TEMPLATE = (assetNames: string[]) => {
  return `帮忙寻找以下资产的最新资讯，并稍微总结下，资产名称：${assetNames.join(',')}。`;
}

export const QUESTION_TEMPLATE = (summary: string) => {
  return `${summary}。
    对于上面的文字，请帮我提问三个问题，回答格式如下（请严格按照以下格式回答，其中[Questions]和[tab]是固定格式，用来标识和分隔问题，请务必保留）：
    [Questions]
    1. 问题1[tab]
    2. 问题2[tab]
    3. 问题3[tab]`; 
  }