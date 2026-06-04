import { defineMermaidSetup } from '@slidev/types'

// Цвета диаграмм под тему Effector (тёмный фон + оранжевый акцент)
export default defineMermaidSetup(() => {
  return {
    theme: 'base',
    themeVariables: {
      // фон и текст
      background: '#1d1d1f',
      textColor: '#fafafa',
      fontFamily: 'Lexend Deca, ui-sans-serif, sans-serif',
      fontSize: '15px',

      // узлы — тёмная поверхность с оранжевой обводкой
      primaryColor: '#26262a',
      primaryBorderColor: '#fe6801',
      primaryTextColor: '#fafafa',
      secondaryColor: '#26262a',
      secondaryBorderColor: '#ff9243',
      secondaryTextColor: '#fafafa',
      tertiaryColor: '#26262a',
      tertiaryBorderColor: '#ff9243',
      tertiaryTextColor: '#fafafa',

      // связи (рёбра графа) — фирменный оранжевый
      lineColor: '#fe6801',
      edgeLabelBackground: '#1d1d1f',
    },
  }
})
