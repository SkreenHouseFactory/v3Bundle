<?php

namespace SkreenHouseFactory\v3Bundle\Twig\Extension;

use Symfony\Component\HttpKernel\KernelInterface;

class toolsExtension extends \Twig_Extension
{
    protected static $slider_count;
    protected $slider_page;
    protected $slider_programs;
    protected $input_slider_size = array(
      '143/180',
      '150/200',
      '990/450',
      '1500/450'
    );
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
            'pic_filter' => new \Twig_Filter_Method($this, 'picFilter'),
            'to_array' => new \Twig_Filter_Method($this, 'to_array'),
            'end' => new \Twig_Filter_Method($this, 'end'),
            'keywords_from_url' => new \Twig_Filter_Method($this, 'keywordsFromUrl'),
            'prepare_for_slider' => new \Twig_Filter_Method($this, 'prepareForSlider'),
            'round_up' => new \Twig_Filter_Method($this, 'roundUp'),

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
          //HACK programmes adultes, TOFIX in API
          if (isset($v->error)) {
            //print_r($v);exit();
            continue;
          }
          $arr[$v->id] = $v;
        }
        return $arr;
      } else {
			  return (array)$stdClass;
      }
    }
    /**
     * cast object as array
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function roundUp($number)
    {
        return ceil($number);
    }


    public function picFilter($test)
    {
      preg_match('#(?<title>medias(\/\w{1,}){1,}\-{0,}\w{1,}.)#i', $test, $matches);
      return $matches['title'];
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
    public function prepareForSlider(Array $programs, $nb_programs_page, $nb_programs_total = null, $slider_page = 0)
    {
     //echo '<!--';
      self::$slider_count++;
      $this->slider_page = $slider_page;
      $this->slider_programs = $this->to_array($programs, true);
      $pages = array();
      //echo "\n".'<br/> $this->slider_programs > '.count($this->slider_programs);
      while (count($this->slider_programs) > 0 || (count($pages) < $nb_programs_total/6 && count($pages) <= 4) ) {
        //echo "\n".'<br/> $pages > '.count($pages);
        //echo "\n".'<br/> $nb_pages_total > '.($nb_programs_total/6);
        $this->slider_page++;
        if ($page_programs = $this->getProgramsForPage($nb_programs_page)) {
          //echo ' page_programs count:'.count($page_programs);
          $slider_progam = $this->getHorizontalSlider($page_programs);
          $type = $slider_progam ? 'horizontal' : 'vertical';
          $pages[] = $this->sortPrograms($page_programs, $nb_programs_page, $type, $slider_progam);
        } else {
          $pages[] = array();
        }
        //echo ' break count:'.count($this->slider_programs);
        //break;
        //print_r($pages);
      }
      //echo '-->';
      return $pages;
    }
    protected function getHorizontalSliderPosition($combinaison) {
      $i = 0;
      foreach ($combinaison as $c => $nb) {
        if (!is_numeric($c)) {
          return $i;
        }
        $i++;
      }
    }
    protected function getHorizontalSlider(&$programs){
      foreach ($programs as $key => $program) {
        if (isset($program->sliderPicture) || 
            (isset($program->maxsize) && $program->maxsize->width > $program->maxsize->height && $program->maxsize->width > 250)) {
          //unset($programs[$key]);
          $programs = array_values($programs);
          //echo "\n".'getHorizontalSlider:'.$program->id.' $key:'.$key;
          if (!isset($program->sliderPicture)) $program->sliderPicture = $program->picture;
          return $program;
        }
      }
    }
    protected function getProgramsForPage($nb_programs_page) {
      //echo '<br>getProgramsForPage:'.count($this->slider_programs);
      $programs = count($this->slider_programs) >= $nb_programs_page ? array_slice($this->slider_programs, 0, $nb_programs_page) : $this->slider_programs;
     //echo "\n".'<br/>getProgramsForPage '.implode('-', array_keys($this->to_array($programs, true)));
      return count($programs) > 0 ? $programs : null;
    }

    protected function sortPrograms($page_programs, $nb_programs_page, $type, $slider_program = null){
      $programs = array();
      $n = 0;
      $i = 0;

      $page_programs = array_values($page_programs);
      $combinaisons = $this->slider_combinaisons[$nb_programs_page][$type];
      //shuffle($combinaisons);
      $combinaison = (self::$slider_count+$this->slider_page)%2 == 0 && isset($combinaisons[1]) ? $combinaisons[1] : $combinaisons[0];
     //echo "\n".'<br/>NEWPAGE '.implode('-', $combinaison);
      //echo '$page_programs_keys '.implode('-', array_keys($page_programs));
      foreach ($combinaison as $c => $nb) {
        if (!isset($page_programs[$i])) {
         //echo "\n".'<br/>stop no more programs:'.$i;
          break;
        }
       //echo "\n".'<br/>i:'.$i.' c:'.$c.' p:'.$page_programs[$i]->id;
  
        if ($n >= $nb_programs_page) {
          //echo ' nottaken:'.$i;
        } else {

          //slider horizontal
          $c = is_numeric($c) ? 1 : $c;
          if (!is_numeric($c) && $type == 'horizontal') {
            //push next current program
            if ($slider_program->id != $page_programs[$i]->id) {
              $page_programs[$i+1] = $page_programs[$i];
            }
            $picture = $slider_program->sliderPicture;
            $program = $slider_program;
           //echo ' -- takeslider:'.$slider_program->id;
            $i++;

          //default
          } else {

            //replace slider_program
            if ($type == 'horizontal' &&
                $page_programs[$i]->id == $slider_program->id &&
                isset($page_programs[$this->getHorizontalSliderPosition($combinaison)])) {
              $program = $page_programs[$this->getHorizontalSliderPosition($combinaison)];
             //echo ' -- replaceslider:'.$program->id;
            //take program
            } else {
              $program = $page_programs[$i];
             //echo ' -- takeprogram:'.$program->id;
            }
            $picture = $program->picture;
          }
          $i++;
          //echo 'picture : $this->slider_size['.$nb_programs_page.']['.$c.']';
          if (isset($this->slider_size[$nb_programs_page][$c])) {
            $program->picture = str_replace('/medias', '/c/medias', str_replace(
              $this->input_slider_size, 
              $this->slider_size[$nb_programs_page][$c], 
              $picture
            ));
          }
          $program->combinaison_type = $c;
          $programs[$i] = $program;
          $n = $n + $nb;
          unset($this->slider_programs[$program->id]);
          //echo ' -1';
          //echo ' n:'.$n.'('.$c.', '.count($this->slider_programs).')';
        }
      }
      return $programs;
    }
}