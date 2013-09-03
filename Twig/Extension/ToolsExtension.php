<?php

namespace SkreenHouseFactory\v3Bundle\Twig\Extension;

use Symfony\Component\HttpKernel\KernelInterface;

class toolsExtension extends \Twig_Extension
{
    protected $slider_programs;
    protected $slider_size = array(
        6 => array(
            '2x2' => '294/370',
            '3x1' => '445/180',
            '2x1' => '294/180',
            '1'=> '143/180'
        )
    );
    protected $slider_combinaisons = array(
        '6'=> array(
           'vertical' => array(
                array('1','1','1','1','1','1'),
                array('2x2' => 4,'1','1')
            ),
           'horizontal' => array(
                array('3x1' => 3,'1','1','1'),
                array('1','1','1','2x1' => 2,'1')
            )
        )
    );
    public function __construct()
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {
        return array(
            'to_array' => new \Twig_Filter_Method($this, 'to_array'),
            'end' => new \Twig_Filter_Method($this, 'end'),
            'keywords_from_url' => new \Twig_Filter_Method($this, 'keywordsFromUrl'),
            'prepare_for_slider' => new \Twig_Filter_Method($this, 'prepareForSlider'),
        );
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'tools';
    }

    /**
     * cast object as array
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function to_array($stdClass, $with_id_as_key = false)
    {
      if ($with_id_as_key) {
        $arr = array();
        foreach ((array)$stdClass as $v) {
          $arr[$v->id] = $v;
        }
        return $arr;
      } else {
			  return (array)$stdClass;
      }
    }

    /**
     * last item of array
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function end($arr)
    {
			return end($arr);
    }

    /**
     * 404 => search
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function keywordsFromUrl($url)
    {
      $keywords = array();
      foreach (explode('-', urldecode($url)) as $word) {
        if (!is_numeric($word)) {
          $keywords[] = $word;
        }
      }
			return implode(' ', $keywords);
    }

    /**
     * slider
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function prepareForSlider(Array $programs, $nb_programs_page)
    {
      $this->slider_programs = $this->to_array($programs, true);
      $pages = array();
      $i=0;
      //echo '<br/> >>>>> '.count($this->slider_programs);
      while ($page_programs = $this->getProgramsForPage($nb_programs_page)) {
        $slider_progam = $this->getHorizontalSlider($page_programs);
        $type = $slider_progam ? 'horizontal' : 'vertical';
        $pages[] = $this->sortPrograms($page_programs, $nb_programs_page, $type, $slider_progam);
        //if (count($this->slider_programs) > $nb_programs_page) {
          break;
          //}
        //echo '<br/> >>>>> '.count($this->slider_programs).' > '.count($page_programs);
        //print_r($pages);
        $i++;
      }
      return $pages;
    }
    protected function getHorizontalSlider(&$programs){
      foreach($programs as $key => $program){
        if (isset($program->sliderPicture) ){
          unset($programs[$key]);
          $programs = array_values($programs);
          //echo ' getHorizontalSlider:'.$program->title;
          return $program;
        }
      }
    }
    protected function getProgramsForPage($nb_programs_page) {
      //echo '<br>getProgramsForPage:'.count($this->slider_programs);
      $programs = count($this->slider_programs) >= $nb_programs_page ? array_slice($this->slider_programs, 0, $nb_programs_page) : $this->slider_programs;
      return count($programs) > 0 ? $programs : null;
    }

    protected function sortPrograms($page_programs, $nb_programs_page, $type, $slider_program = null){
      $programs = array();
      $n = 0;
      $i = 0;

      $page_programs = array_values($page_programs);
      $combinaisons = $this->slider_combinaisons[$nb_programs_page][$type];
      shuffle($combinaisons);
      //echo '<br/><br/>NEWPAGE '.implode('-', $combinaisons[0]);
      foreach ($combinaisons[0] as $c => $nb) {
        //echo '<br/>'.$c;
        if (!isset($page_programs[$i])) {
          //echo ' stop no more programs:'.$i;
          break;
        }
  
        if ($n >= $nb_programs_page) {
          //echo ' nottaken:'.$i;
        } else {
          $c = is_numeric($c) ? 1 : $c;
          if ($nb > 1 && $type == 'horizontal' && isset($program->sliderPicture)) {
            //echo ' takeslider:'.$i;
            $picture = $slider_program->sliderPicture;
            $program = $slider_program;
          } else {
            //echo ' takeprogram:'.$i;
            $program = $page_programs[$i];
            $picture = $program->picture;
            $i++;
          }
          if (isset($this->slider_size[$nb_programs_page][$c])) {
            $program->picture = str_replace(array('150/200','990/450'), $this->slider_size[$nb_programs_page][$c].'/c', $picture);
          }
          //echo '$c:'.$c;
          $program->combinaison_type = $c;
          $programs[] = $program;
          $n = $n + $nb;
          //echo '$slider_progam: '.($slider_progam?$slider_progam->id:null);
          //echo 'is_array: '.is_array($this->slider_programs).' .... '.is_array(array($program));exit();
          //print_r(array($this->slider_programs, array($program)));
          //exit();
          unset($this->slider_programs[$program->id]);
          //echo ' -1';
          //echo ' n:'.$n.'('.$c.', '.count($this->slider_programs).')';
        }
      }
      return $programs;
    }
}