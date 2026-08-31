'use strict';

global.window=global;

require('../assets/ingredient-knowledge.js');
require('../assets/ingredient-knowledge-regression.js');

try {
  const result=global.UHHIngredientKnowledgeRegression.run();
  process.stdout.write(`${JSON.stringify(result,null,2)}\n`);
  process.exitCode=result&&result.status==='PASS'?0:1;
} catch (error) {
  process.stderr.write(`${error&&error.stack?error.stack:String(error)}\n`);
  process.exitCode=1;
}
