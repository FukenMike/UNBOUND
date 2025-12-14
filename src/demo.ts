/**
 * Demo Script for UNBOUND Ingestion Engine
 * 
 * Demonstrates the text ingestion process by loading example files
 * and showing the resulting structured output.
 */

import { ingestFromFile } from './core/ingestion';
import { Project } from './core/manuscript';

/**
 * Pretty-print a project structure
 */
function displayProject(project: Project): void {
  console.log('\n' + '='.repeat(80));
  console.log(`PROJECT: ${project.title}`);
  if (project.author) {
    console.log(`Author: ${project.author}`);
  }
  console.log(`Created: ${project.createdAt.toISOString()}`);
  console.log('='.repeat(80));
  
  for (const section of project.sections) {
    // Skip sections with no chapters
    if (section.chapters.length === 0) {
      continue;
    }
    
    console.log(`\n[SECTION: ${section.type.toUpperCase()}]`);
    
    for (const chapter of section.chapters) {
      console.log(`\n  Chapter: "${chapter.title}"`);
      console.log(`  ID: ${chapter.id}`);
      
      if (chapter.scenes.length > 0) {
        console.log(`  Scenes: ${chapter.scenes.length}`);
        
        for (let i = 0; i < chapter.scenes.length; i++) {
          const scene = chapter.scenes[i];
          if (!scene) continue;
          console.log(`\n    Scene ${i + 1}:`);
          console.log(`    - Content blocks: ${scene.content.length}`);
          
          // Show first paragraph as preview
          if (scene.content.length > 0) {
            const firstPara = scene.content[0];
            if (firstPara) {
              const preview = firstPara.text.substring(0, 80) + 
                            (firstPara.text.length > 80 ? '...' : '');
              console.log(`    - Preview: "${preview}"`);
            }
          }
        }
      } else {
        console.log(`  Content blocks: ${chapter.content.length}`);
        
        // Show first paragraph as preview
        if (chapter.content.length > 0) {
          const firstPara = chapter.content[0];
          if (firstPara) {
            const preview = firstPara.text.substring(0, 80) + 
                          (firstPara.text.length > 80 ? '...' : '');
            console.log(`  - Preview: "${preview}"`);
          }
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Display statistics about the project
 */
function displayStats(project: Project): void {
  let totalChapters = 0;
  let totalScenes = 0;
  let totalParagraphs = 0;
  let totalWords = 0;
  
  for (const section of project.sections) {
    totalChapters += section.chapters.length;
    
    for (const chapter of section.chapters) {
      if (chapter.scenes.length > 0) {
        totalScenes += chapter.scenes.length;
        
        for (const scene of chapter.scenes) {
          totalParagraphs += scene.content.length;
          
          for (const block of scene.content) {
            totalWords += block.text.split(/\s+/).length;
          }
        }
      } else {
        totalParagraphs += chapter.content.length;
        
        for (const block of chapter.content) {
          totalWords += block.text.split(/\s+/).length;
        }
      }
    }
  }
  
  console.log('STATISTICS:');
  console.log(`- Chapters: ${totalChapters}`);
  console.log(`- Scenes: ${totalScenes}`);
  console.log(`- Paragraphs: ${totalParagraphs}`);
  console.log(`- Approximate word count: ${totalWords}`);
}

/**
 * Main demo function
 */
async function main() {
  console.log('UNBOUND Ingestion Engine Demo');
  console.log('==============================\n');
  
  // Demo 1: Sample manuscript with scenes
  console.log('Demo 1: Ingesting "sample-manuscript.txt"');
  console.log('(Includes chapters and scene breaks marked with ***)');
  
  const project1 = await ingestFromFile(
    'examples/sample-manuscript.txt',
    {
      title: 'The Mysterious Bookstore',
      author: 'Demo Author',
      detectScenes: true,
    }
  );
  
  displayProject(project1);
  displayStats(project1);
  
  // Demo 2: Simple story
  console.log('\n\nDemo 2: Ingesting "simple-story.txt"');
  console.log('(Includes prologue and chapters with ### scene breaks)');
  
  const project2 = await ingestFromFile(
    'examples/simple-story.txt',
    {
      title: "Emma's Adventure",
      author: 'Demo Author',
      detectScenes: true,
    }
  );
  
  displayProject(project2);
  displayStats(project2);
  
  // Demo 3: Show JSON structure
  console.log('\n\nDemo 3: JSON Structure Sample');
  console.log('(First chapter of project 1 as JSON)');
  
  const firstChapter = project1.sections
    .find(s => s.type === 'body')?.chapters[0];
  
  if (firstChapter) {
    console.log(JSON.stringify(firstChapter, null, 2));
  }
  
  console.log('\n\nDemo complete!');
}

// Run the demo
main().catch(error => {
  console.error('Error running demo:', error);
  process.exit(1);
});
