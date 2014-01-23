<?php

/*
 * This file is part of the SkreenHouseFactoryV3Bundle package.
 *
 * (c) Brickstorm <http://brickstorm.org/>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace SkreenHouseFactory\v3Bundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use SkreenHouseFactory\v3Bundle\Api\ApiManager;

//les vrais inconnus
ini_set('post_max_size', '2048M');
ini_set('upload_max_filesize', '2048M');

class ChannelController extends Controller
{
  private function blockDomain(Request $request) {
    if ($this->get('kernel')->getEnvironment() == 'prod' && 
      !strstr($request->getHost(), 'www.') && 
      !strstr($request->getHost(), 'replay.') && 
      !strstr($request->getHost(), 'preprod.') && 
      !strstr($request->getHost(), 'preprod-') && 
      !strstr($request->getHost(), 'myskreen.') && 
      !strstr($request->getHost(), 'inconnus.') && 
      !strstr($request->getHost(), '.typhon.net')) {
      throw $this->createNotFoundException('Page does not exist');
  }
}
  /**
  * channel
  */
  public function channelAction(Request $request)
  {
    $this->blockDomain($request);

    //hack seo
    if ($request->get('slug') == 'tv-en-direct') {
      return $this->redirect('http://www.myskreen.com', 301);
    }

    $api   = $this->get('api');
    $params = array(
      'from_slug'  => $request->get('slug'),
      'with_live'  => !$request->get('format') && !$request->get('page') ? true : false,
      'with_next_live' => !$request->get('format') && !$request->get('page') ? true : false,
      //'with_prev_live' => true,
      'with_description'  => true,
      'channel_img_width' => 60,
      'img_width' => 150,
      'img_height' => 200,
      // 'live_img_width' => 150,
      // 'live_img_height' => 200,
      // 'slider_img_width'  => 900,
      // 'slider_img_height' => 300,
      'live_player_width' => 420,
      'live_player_height' => 270,
      'with_epg' => !$request->get('format') && !$request->get('page') ? true : false,
      'with_replay' => !$request->get('format') && !$request->get('page') ? true : false,
      'with_best_offer' => !$request->get('format') && !$request->get('page') ? true : false,
      'with_programs' => true,
      'with_img_maxsize'=>true,
      'offset' => $request->get('page', 1) * 30 - 30,
      'nb_results' => 30,
      'facets' => $this->buildFacets($request),
      'disable_search_by_format' => true,
      'sorter' => 'year',
      'preview' => $request->get('preview')
    );
    $data = $api->fetch('channel'.($request->get('id')?'/'.$request->get('id'):null), $params);

    //print("<pre>");print_r($data);
    //die($api->url);
    //echo "\n".'category_slug:' . $request->get('category_slug');
    //echo "\n".'route:'  .$request->get('_route');
    //exit;
    //404
    if (isset($data->error) && $data->error) {
      throw $this->createNotFoundException('Channel does not exist');
    }
   /* 
    //seo
    if (!in_array($request->get('facet'), (array)$data->facets_seo_url->category) && 
        !in_array($request->get('facet'), (array)$data->facets_seo_url->subcategory) && 
        strlen($request->get('facet')) > 1) {
      return $this->redirect($data->seo_url, 301);
    }
    */
    //redirect fournisseur synonyme
    if (isset($data->redirect) && $data->redirect) {
      return $this->redirect($data->redirect, 301);
    }

    //bad page
    if ($request->get('page') && 
        isset($data->programs) && 
        count((array)$data->programs) == 0) {
      //return $this->redirect(str_replace('/page-'.$request->get('page'), '', $request->getPathInfo()), 301);
      
    //bad url
    } elseif (!strstr($request->getPathInfo(), '/partners/') &&
      ($request->getPathInfo() != $data->seo_url &&
      $request->getPathInfo() != $data->seo_url . $request->get('format') . '/' &&
      $request->getPathInfo() != $data->seo_url . $request->get('format') . '/' . $request->get('facet') . '/' &&
      $request->getPathInfo() != $data->seo_url . $request->get('format') . '/' . $request->get('facet') .  '/page-' . $request->get('page') . '/' &&
      $request->getPathInfo() != $data->seo_url . 'page-' . $request->get('page') . '/' &&
      $request->getPathInfo() != $data->seo_url . $request->get('facet') . '/') &&
  (!property_exists($data,'channel') || str_replace('/','',$request->getPathInfo()) != $data->channel->slug)
  ) {
      if ($this->container->getParameter('kernel.environment') == 'dev') {
        echo "\n".'pathInfo: ' . $request->getPathInfo();
        echo "\n".'----';
        echo "\n".'facet: ' . $data->seo_url . $request->get('facet') . '/';
        echo "\n".'format: ' . $data->seo_url . $request->get('format') . '/';
        echo "\n".'format+cat: ' . $data->seo_url . $request->get('format') . '/' . $request->get('facet') . '/' ;
        echo "\n".'format+cat+page: ' . $data->seo_url . $request->get('format') . '/' . $request->get('facet') .  '/page-' . $request->get('page') . '/';
        echo "\n".'page: ' . $data->seo_url . 'page-' . $request->get('page') . '/';
        echo "\n".'default '.$request->getPathInfo().' != '.$data->seo_url.' => '.($request->getPathInfo() != $data->seo_url);
        echo "\n".'redirect '.$data->seo_url;
        exit();
      }
      return $this->redirect($data->seo_url, 301);
    }
 
    //Si channel mais facet => view fournisseur
    if (property_exists($data, 'channel') && 
      property_exists($data->channel, 'fournisseur') && 
      ($request->get('format')  || $request->get('facet'))) {
      $data = $data->channel->fournisseur;
    $data->description = null;
  }

    //si ChannelFournisseur
  if (property_exists($data, 'channel') && 
    $data->channel->type == 'ChannelFournisseur') {
    $data->channel->fournisseur = $data;
  }

  $params = array();
  if (isset($data->facets)) {
   $params = array(
    'formats' => array_combine(explode(';', $data->facets_seo_url->format),explode(';', $data->facets->format)),
    'categories' => array_combine(explode(';', $data->facets_seo_url->category),explode(';', $data->facets->category)),
    'subcategories' => array_combine(explode(';', $data->facets_seo_url->subcategory),explode(';', $data->facets->subcategory)),
    'access' => explode(';', isset($data->facets->access) ? $data->facets->access : null),
    'alpha_available' => explode(';', $data->facets->alpha),
    'alpha' => array(
      1,2,3,4,5,6,7,8,9,
      'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
      )
    );
  }
      // Si on est une une page sk_channel, on redirige vers le twig correct
  if (property_exists($data, 'channel')) {
    $custom_header = false;
    $from_selection = false;
    if($request->get('partner')){
      $partner = true;
    } else {
      $partner = false;
    }
    if ( $this->get('templating')->exists('SkreenHouseFactoryV3Bundle:Channel:_header-'.$data->channel->id.'.html.twig')){
      $custom_header = true;
    } 

    if(isset($data->channel->fournisseur)){
      $data->channel->fournisseur = (object)array_merge($params, (array)$data->channel->fournisseur);
    }
    $params = array_merge($params, array(
      'from_selection'=> $from_selection,
      'data' => $data,
      'channel' => $data->channel,
      'custom_header' => $custom_header,
      'partner' => $partner 
      ));
      if($request->get('css') && $request->get('header') && $request->get('footer')){
        $params = array_merge($params,array(
          'css' => $request->get('css'),
          'header' => $request->get('header'),
          'footer' => $request->get('footer')
        ));
      }
  //      print_r($params['data']);exit();
    if ($data->channel->type == 'ChannelFournisseur' ||
      property_exists($data->channel, 'fournisseur')) {
          //$data->channel->description = $data->channel->fournisseur->description;
      $data->channel->fournisseur->formats = array_combine(explode(';', $data->channel->fournisseur->facets_seo_url->format),explode(';', $data->channel->fournisseur->facets->format));
    $data->channel->fournisseur->alpha_available = explode(';', $data->channel->fournisseur->facets->alpha);
    $data->channel->fournisseur->alpha = array(
      1,2,3,4,5,6,7,8,9,
      'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
      );

    unset($data->channel->fournisseur->facets);
    unset($data->channel->fournisseur->facets_seo_url);
  }

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:channel.html.twig', $params);
  if ($request->get('slug') != $data->channel->slug) {
          // Alias du channel fourni
    return $this->redirect('/' . $data->channel->slug, 301);
  }
  } else {
    $params = array_merge($params, array('channel' => $data));
    $data->programs = (array)$data->programs;
    $data->picture = str_replace('150/200', '240/320', isset($data->programs[0]) && is_object($data->programs[0]) ? $data->programs[0]->picture : null);
        //$template = isset($data->epg) && $data->epg ? 'channel-replay' : 'channel';

    $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:fournisseur.html.twig', $params);
  }

  $maxage = 60;
  $response->setPublic();
  $response->setMaxAge($maxage);
  $response->setSharedMaxAge($maxage);

  return $response;
}
  // channel PBLV
public function header28Action($data,$from_selection,$channel,$fav,$trigger_fav){
  $api   = $this->get('api');
  $params = array(
   'with_player' => true,
   'with_offers' => true,
       //'offers_type'=> 'plays'
   );
  $program = $api->fetch('program/3517970', $params);
    //echo $api->url;
  $play = null;
  
  foreach( $program->offers->deporte as $play){
    if( isset($play->deporte) && isset($play->cost) && $play->deporte && $play->cost){
      break;
    }
  }

  foreach( $program->datas_offers->episodes as $episode) {
    if( isset($episode->title) && $episode->id == $play->episode_id ){
      break;
    }
  }
  
  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-28.html.twig', array(
    'play' => $play,
    'episode' => $episode,
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));

  return $response; 
}

/* varda */
public function header8Action($data,$from_selection,$channel,$fav,$trigger_fav){
  $api   = $this->get('api');
  $params = array(
    'ids' => '3051395,95090,237196,261402,413119,110631,4817914,185960,369379',
    'with_player' => true,
    'with_teaser' => true,
    'allow_with'=> true
    );
  $programs = $api->fetch('program', $params);
    //echo $api->url;
  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-8.html.twig', array(
    'programs'=> $programs,
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));
  return $response; 
}

/* mariage à l'anglaise */
public function header35Action($data,$from_selection,$channel,$fav,$trigger_fav){

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-35.html.twig', array(
     // 'episode_id'=> $play->episode_id,
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));
  return $response; 
}

/* y'a pas d'age */
public function header54Action($data,$from_selection,$channel,$fav,$trigger_fav){

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-54.html.twig', array(
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));

  return $response; 
}
public function header55Action($data,$from_selection,$channel,$fav,$trigger_fav){

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-55.html.twig', array(
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));

  return $response; 
}
public function header56Action($data,$from_selection,$channel,$fav,$trigger_fav){

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-56.html.twig', array(
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));

  return $response; 
}
public function header60Action($data,$from_selection,$channel,$fav,$trigger_fav){

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-60.html.twig', array(
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));

  return $response; 
}
public function header61Action($data,$from_selection,$channel,$fav,$trigger_fav){

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-61.html.twig', array(
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));

  return $response; 
}
public function header62Action($data,$from_selection,$channel,$fav,$trigger_fav){

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-62.html.twig', array(
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));

  return $response;  
}
public function header64Action($data,$from_selection,$channel,$fav,$trigger_fav){

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-64.html.twig', array(
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));

  return $response;  

}
public function header1Action($data,$from_selection,$channel,$fav,$trigger_fav){

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-1.html.twig', array(
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection
    ));

  return $response; 
}




public function header65Action($data,$from_selection,$channel,$fav,$trigger_fav,$partner){
  $api   = $this->get('api');
  $selection_sketches = array();
  $params =  array(
//    'with_description'  => true,
    'channel_img_width' => 60,
    'img_width' => 150,
    'img_height' => 200,
    'with_programs' => true,
    'with_offers' => true,
    'offers_type' => 'play',
    'with_player' => true,
    'player' => 'iframe',
    //'img_width' => 150,
    //'img_height' => 200,
    'allow_with' => true
  );
  
  /*-------------------------------------------------------------------- Les Sketches*/
  $obj1 = $api->fetch('www/slider/pack/10855312', $params);
  $ajout1 = $api->fetch('www/slider/pack/10855202', $params);
  $ajout2 = $api->fetch('www/slider/pack/12021382', $params);
  $ajout3 = $api->fetch('www/slider/pack/12021387', $params);
  $ajout4 = $api->fetch('www/slider/pack/12021394', $params);
  $ajout5 = $api->fetch('www/slider/pack/10855277', $params);
  $obj1->programs = (object)array_merge(array_values((array)$obj1->programs),array_values((array)$ajout1->programs),array_values((array)$ajout2->programs),array_values((array)$ajout3->programs),array_values((array)$ajout4->programs),array_values((array)$ajout5->programs));
  /*-------------------------------------------------------------------- Les Pubs*/
  
  
  $obj2 = $api->fetch('www/slider/pack/10855358', $params);
  /*-------------------------------------------------------------------- Les Chansons*/
  $obj3 = $api->fetch('www/slider/pack/12021377', $params);
  $ajout1 = $api->fetch('www/slider/pack/10855241', $params);
   
  $obj3->programs = (object)array_merge(array_values((array)$obj3->programs),array_values((array)$ajout1->programs));
     
  $selection_sketches[1]  = $obj1;
  $selection_sketches[2]  = $obj2;
  $selection_sketches[3]  = $obj3;

  $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:_header-65.html.twig', array(
    'data' => $data,
    'fav' => $fav,
    'trigger_fav'=> $trigger_fav,
    'channel'=> $channel,
    'from_selection' => $from_selection,
    'selection_sketches'=>(object)$selection_sketches,
    'partner' => $partner
    ));

    $response->setCache(array(
        'max_age'       => 3600,
        's_maxage'      => 3600,
        'public'        => true,
    ));

  return $response; 
}

protected function buildFacets(Request $request) {
    //echo '$facet:'.$request->get('facet');
    //echo '$route:'.$request->get('_route');
  $facets = array();
  if (strlen($request->get('facet')) == 1) {
    $facets[] = 'alpha:' . $request->get('facet');
  } elseif (in_array($request->get('facet'), array('video-a-la-demande', 'cinema'))) {
    $facets[] = 'access:' . str_replace(array('video-a-la-demande'), array('vod'), $request->get('facet'));
  } elseif ($request->get('facet')) {
    if (in_array($request->get('_route'), array('channel_format_facet', 'channel_format_facet_page'))) {
      $facets[] = 'category:' . $request->get('facet');
    } else {
      $facets[] = 'subcategory:' . $request->get('facet');
    }
  }
  if ($request->get('format')) {
    $facets[] = 'format:' . $request->get('format');
  }
  if ($request->get('access')) {
    $facets[] = 'access:' . str_replace(
      array('video-a-la-demande', 'tv', 'replay', 'cinema', 'dvd'), 
      array('vod', 'tv', 'catchup', 'cinema', 'dvd'), 
      $request->get('access')
      );
  }

  return implode(',', $facets);
}
}